/**
 * Per-session model directory: the ONE state both selection entries share.
 *
 * dsh 0.1.5 composes it from two Host sources instead of one RPC: the
 * Host-generation catalog shared by every Session (advisory topology) and the
 * Session's own durable `modelSelection` projection (what this session will
 * use next). Both entries load through the same controller and submit through
 * the same `session.selectModel` call, so the host stays the single fact
 * source and the store is one shared echo — a switch made in either entry is
 * what the other shows next.
 */
import type {
  ModelCatalogFailure, ModelProviderGroup, ModelSelection, ModelSelectionProjection,
} from '@deepseek-ai/dsh-api-session-controller/types'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { TypertClientRemote } from '@deepseek-ai/dsh-typert-protocol'
import { createSnapshotStore, type ObservableSnapshot, type SnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { ModelCatalogDirectory } from './catalog.ts'

/** Directory snapshot both entries render from. */
export interface ModelDirectoryState {
  /** Effective selection: durable next-request projection, then Host default. */
  current: ModelSelection | null
  /**
   * Whether an adapter serves the current selection's provider, as the host reports
   * it — null before the first load, which is NOT the same as blocked. Read
   * this rather than "current matches no group": catalog membership is
   * advisory, so a route serving a model it stopped advertising is missing
   * from the groups yet perfectly usable.
   */
  routable: boolean | null
  /** Successfully loaded provider groups (last good load). */
  groups: readonly ModelProviderGroup[]
  /** Provider-local failures from the last load; usable groups stay usable. */
  failures: readonly ModelCatalogFailure[]
  /** Lifecycle of the in-flight operation. */
  status: 'idle' | 'loading' | 'ready' | 'selecting' | 'error'
  /** Whole-request or selection failure text; null when none. */
  error: string | null
}

/**
 * The projection face value is opaque to this package; the Host shapes it into
 * the durable model-selection fold. Absent means "this Session has not folded
 * a selection yet", which is not the same as an empty one.
 * @param value - the projection snapshot's raw value.
 * @returns the typed fold, or undefined when the Session carries none.
 */
function modelSelectionProjection(value: unknown): ModelSelectionProjection | undefined {
  return value === undefined || value === null ? undefined : value as ModelSelectionProjection
}

/** One session's shared directory controller; disposed with the session scope. */
export class ModelDirectory {
  /** The shared snapshot both entries render from (uSES-safe store). */
  readonly store: SnapshotStore<ModelDirectoryState> = createSnapshotStore<ModelDirectoryState>({
    current: null, routable: null, groups: [], failures: [], status: 'idle', error: null,
  })

  /** Latest selection operation wins; an older response never overwrites a newer one. */
  private generation = 0
  private disposed = false
  /** Whether the catalog + projection pair ever produced an effective selection. */
  private resolved = false
  private readonly unsubscribeCatalog: () => void
  private readonly unsubscribeSelection: () => void

  /**
   * @param sessions - the session wire face (captured from the plugin's root connection).
   * @param sessionId - the owning session.
   * @param available - whether this session may use Agent-bound model RPCs.
   * @param catalog - Host-generation catalog shared by every Session.
   * @param projected - durable model selection projected from Session history.
   */
  constructor(
    private readonly sessions: Pick<TypertClientRemote['session'], 'selectModel'>,
    private readonly sessionId: SessionId,
    private readonly available: () => boolean,
    private readonly catalog: ModelCatalogDirectory,
    private readonly projected: ObservableSnapshot<unknown>,
  ) {
    this.unsubscribeCatalog = catalog.store.subscribe(() => { this.syncInputs() })
    this.unsubscribeSelection = projected.subscribe(() => { this.syncInputs() })
    this.syncInputs()
  }

  /**
   * Ensure the Host generation's shared advisory catalog is loaded.
   * @returns the fresh directory value.
   */
  async load(): Promise<ModelDirectoryState> {
    this.assertAvailable()
    await this.catalog.load()
    this.syncInputs()
    return this.store.getSnapshot()
  }

  /**
   * Select the complete provider/model/reasoning selection (both entries submit through here). The durable
   * projection frame updates the shared current; failure surfaces on the store
   * and throws so each entry's own retry surface engages.
   * @param selection - provider, provider-owned model id, and optional adapter-owned effort.
   */
  async select(selection: ModelSelection): Promise<void> {
    this.assertAvailable()
    const generation = ++this.generation
    this.store.update((s) => { s.status = 'selecting'; s.error = null })
    const result = await this.sessions.selectModel({
      sessionId: this.sessionId,
      provider: selection.provider,
      model: selection.model,
      ...selection.reasoningEffort === undefined
        ? {}
        : { reasoningEffort: selection.reasoningEffort },
    })
    if (this.disposed || generation !== this.generation) {
      if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`)
      return
    }
    if (!result.ok) {
      this.store.update((s) => { s.status = 'error'; s.error = `${result.error.code}: ${result.error.message}` })
      throw new Error(`session.selectModel failed: ${result.error.code}: ${result.error.message}`)
    }
    // The Host validated the route before accepting it, and the accepted value
    // arrives through the durable projection; only the lifecycle is settled here.
    this.store.update((s) => { s.status = 'ready'; s.error = null })
    this.syncInputs()
  }

  /**
   * Invalidate an in-flight selection response from the previous Host generation.
   */
  resetConnected(): void {
    if (this.disposed) return
    ++this.generation
    this.store.update((state) => {
      if (state.status === 'selecting') state.status = 'idle'
      state.error = null
    })
    this.syncInputs()
  }

  /** Scope teardown: late settlements lose write access to the store. */
  dispose(): void {
    this.disposed = true
    this.unsubscribeSelection()
    this.unsubscribeCatalog()
  }

  private assertAvailable(): void {
    if (!this.available()) {
      throw new Error('model selection is unavailable for addressed subagent sessions')
    }
  }

  /**
   * Project the shared catalog + this Session's durable selection onto the
   * rendered snapshot. The catalog and the projection arrive independently, so
   * this runs on either change: nothing renders until both are readable, and a
   * catalog failure after a successful resolve is surfaced without discarding
   * the last good groups.
   */
  private syncInputs(): void {
    if (this.disposed) return
    const catalog = this.catalog.store.getSnapshot()
    const projected = modelSelectionProjection(this.projected.getSnapshot())
    if (catalog.status !== 'ready' || catalog.value === null || projected === undefined) {
      if (this.resolved) {
        if (catalog.status === 'error') {
          this.store.update((state) => { state.status = 'error'; state.error = catalog.error })
        }
        return
      }
      this.store.set({
        current: null,
        routable: null,
        groups: [],
        failures: [],
        status: catalog.status === 'error' ? 'error' : 'loading',
        error: catalog.error,
      })
      return
    }
    const current = projected.next ?? catalog.value.default
    this.resolved = true
    this.store.set({
      current,
      routable: catalog.value.routableProviders.includes(current.provider),
      groups: catalog.value.groups,
      failures: catalog.value.failures,
      status: this.store.getSnapshot().status === 'selecting' ? 'selecting' : 'ready',
      error: null,
    })
  }
}
