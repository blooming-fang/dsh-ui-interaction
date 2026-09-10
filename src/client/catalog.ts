/**
 * One Host-generation model catalog shared by every Session selector.
 *
 * dsh 0.1.5 replaced the per-session `session.models` read with a
 * Host-generation catalog (`ctx.remote.session.modelCatalog`) plus the
 * Session's durable `modelSelection` projection: the catalog is the whole
 * provider/model topology of the running Host, and each Session only owns the
 * selection it persisted. This class owns that shared catalog value and its
 * one in-flight load, so every Session directory (and both selection entries)
 * read one cached read instead of one RPC per session.
 *
 * A generation counter guards the load: a response from a previous Host
 * generation never overwrites the current one.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ModelCatalog } from '@deepseek-ai/dsh-api-remotes/client'
import { createSnapshotStore, type SnapshotStore } from '@deepseek-ai/dsh-client-store'

/** Observable lifecycle of the shared model catalog. */
export interface ModelCatalogState {
  /** The Host generation's catalog; null until the first successful load. */
  value: ModelCatalog | null
  /** Lifecycle of the in-flight load. */
  status: 'idle' | 'loading' | 'ready' | 'error'
  /** Load failure text; null when none. */
  error: string | null
}

/** Loads at most one model catalog for the current Host generation. */
export class ModelCatalogDirectory {
  /** Current shared catalog value and load lifecycle. */
  readonly store: SnapshotStore<ModelCatalogState> = createSnapshotStore<ModelCatalogState>({
    value: null, status: 'idle', error: null,
  })

  /** Bumped by every invalidation; a stale response loses write access. */
  private generation = 0
  /** The one in-flight load, shared by every caller until it settles. */
  private inflight: Promise<ModelCatalog> | undefined

  /**
   * @param ctx - the providing plugin's context, whose `remote.session`
   * namespace carries the Host-generation catalog.
   */
  constructor(private readonly ctx: ClientContext) {}

  /**
   * Return the current generation's catalog, sharing its one in-flight load.
   * @returns the loaded global catalog.
   */
  load(): Promise<ModelCatalog> {
    const state = this.store.getSnapshot()
    if (state.status === 'ready' && state.value !== null) return Promise.resolve(state.value)
    if (this.inflight !== undefined) return this.inflight
    const generation = this.generation
    this.store.update((draft) => {
      draft.status = 'loading'
      draft.error = null
    })
    const operation = this.ctx.remote.session.modelCatalog().then((response) => {
      if (!response.ok) throw new Error(`${response.error.code}: ${response.error.message}`)
      if (generation === this.generation) {
        this.store.set({ value: response.value, status: 'ready', error: null })
      }
      return response.value
    }).catch((error: unknown) => {
      if (generation === this.generation) {
        this.store.update((draft) => {
          draft.status = 'error'
          draft.error = error instanceof Error ? error.message : String(error)
        })
      }
      throw error
    }).finally(() => {
      if (generation === this.generation && this.inflight === operation) this.inflight = undefined
    })
    this.inflight = operation
    return operation
  }

  /**
   * Invalidate the loaded catalog; the next explicit menu read reloads it.
   * @param clear - whether values from the previous Host generation must be hidden.
   */
  private invalidate(clear = false): void {
    this.generation += 1
    this.inflight = undefined
    const value = clear ? null : this.store.getSnapshot().value
    this.store.set({ value, status: 'idle', error: null })
  }

  /** Invalidate and reload the catalog after a Host-side model input changes. */
  refresh(): void {
    this.invalidate()
    this.load().catch(() => { /* the next explicit menu read remains the retry surface */ })
  }

  /** Clear Host-specific values and load the replacement Host generation. */
  resetGeneration(): void {
    this.invalidate(true)
    this.load().catch(() => { /* the next explicit menu read remains the retry surface */ })
  }
}
