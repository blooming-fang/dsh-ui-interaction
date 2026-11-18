/**
 * The bundle's two feature switches.
 *
 * Both groups ship ON, and an unwritten profile section means ON too, so a
 * fresh install behaves exactly like the previous release and a Host that
 * serves no such namespace keeps every feature live.
 *
 * The values live in this package's OWN profile entry config
 * (`dsh-ui-interaction`), which the Host projects as a settings namespace. The
 * card writes through `ctx.configForms`, the Host rewrites that row in the
 * profile patch, the fiber re-resolves its config, and the accepted section
 * comes back through the settings mirror. A flip therefore mounts or tears down
 * a feature group live: no reload, no reinstall.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'

/** Profile entry id, which is also this plugin's settings namespace. */
export const SWITCHES_NAMESPACE = 'dsh-ui-interaction'

/** The two switch values. */
export interface FeatureSwitches {
  /** Model selector (with its native options slot), sidebar panel grid and CTA, site-wide motion, logo removal. */
  interaction: boolean
  /** Warm-paper palette and the composer's highlight ring. */
  appearance: boolean
}

/** Values before the Host answers — and forever on a Host that serves no section. */
export const DEFAULT_SWITCHES: Readonly<FeatureSwitches> = Object.freeze({ interaction: true, appearance: true })

/** Switch fields in display order. */
export const SWITCH_FIELDS = ['interaction', 'appearance'] as const

/** One switch field. */
export type SwitchField = typeof SWITCH_FIELDS[number]

/** The part of one settings namespace snapshot this plugin reads. */
export interface SwitchSection {
  /** `loading` until the first accepted section, then `ready` or `unavailable`. */
  status: 'loading' | 'ready' | 'unavailable'
  /** Accepted section; undefined before the first one. */
  value: Partial<FeatureSwitches> | undefined
  /** Whether the Host document accepts writes. */
  writable: boolean
}

/**
 * One configuration form, described structurally: the settings provider owns
 * the class, and this bundle must not depend on that package's types.
 */
export interface SwitchForm {
  /** @returns the current sync snapshot (stable until the next change). */
  getSnapshot(): SwitchSection
  /**
   * Observe snapshot replacements.
   * @param listener - invoked after each change.
   * @returns the disposer removing this listener.
   */
  subscribe(listener: () => void): () => void
  /**
   * Queue one field write.
   * @param field - field inside the namespace section.
   * @param value - the value the user picked.
   * @returns whether the Host accepted it.
   */
  set(field: string, value: unknown): Promise<boolean>
}

/** The settings provider's shared-form factory, described structurally. */
export interface ConfigFormsFace {
  /**
   * Get the shared form of one Host plugin entry.
   * @param entryId - unique Host plugin entry id.
   * @returns that entry's form.
   */
  get(entryId: string): SwitchForm
}

/** What the card renders. */
export interface SwitchesState extends FeatureSwitches {
  /** Whether the Host document accepts writes. */
  writable: boolean
  /** Field whose write is in flight, while one is. */
  pending: SwitchField | undefined
}

/**
 * One shared switch state: the card renders it, every feature gate follows it.
 * The form is attached later (the settings service arrives asynchronously, and
 * may never arrive), which is why the model owns the snapshot instead of
 * projecting on demand.
 */
export class FeatureSwitchModel {
  private readonly listeners = new Set<() => void>()
  private snapshot: SwitchesState = {
    ...DEFAULT_SWITCHES,
    writable: false,
    pending: undefined,
  }

  private form: SwitchForm | undefined
  private off: (() => void) | undefined
  /** Field whose write is in flight (kept outside the snapshot source so the publish below sees it). */
  private pending: SwitchField | undefined

  /**
   * Attach the Host-backed form once the settings service is available.
   * @param form - the shared form of this plugin's entry.
   */
  bind(form: SwitchForm): void {
    this.off?.()
    this.form = form
    this.off = form.subscribe(() => { this.publish() })
    this.publish()
  }

  /** Detach the form; the switches fall back to their defaults. */
  unbind(): void {
    this.off?.()
    this.off = undefined
    this.form = undefined
    this.publish()
  }

  /** @returns the current state (stable reference until the next change). */
  getSnapshot = (): SwitchesState => this.snapshot

  /**
   * Observe state changes.
   * @param listener - invoked after each change.
   * @returns the disposer removing this listener.
   */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /**
   * Whether one feature group is on.
   * @param field - the switch this group follows.
   * @returns the switch value now in force.
   */
  enabled(field: SwitchField): boolean {
    return this.snapshot[field]
  }

  /**
   * Flip one switch. Ignored while another write is in flight or when the Host
   * document is read-only, so two writes cannot race over one revision fence.
   * @param field - the switch to write.
   * @param next - the value the user picked.
   */
  set(field: SwitchField, next: boolean): void {
    const form = this.form
    if (form === undefined || this.pending !== undefined || !this.snapshot.writable) return
    this.pending = field
    this.publish()
    void form.set(field, next).catch(() => false).finally(() => {
      this.pending = undefined
      this.publish()
    })
  }

  /** Release the form subscription and every listener. */
  dispose(): void {
    this.off?.()
    this.off = undefined
    this.form = undefined
    this.listeners.clear()
  }

  /** @returns the state projected from the attached form (or the defaults). */
  private project(): SwitchesState {
    const section = this.form?.getSnapshot()
    return {
      interaction: section?.value?.interaction ?? DEFAULT_SWITCHES.interaction,
      appearance: section?.value?.appearance ?? DEFAULT_SWITCHES.appearance,
      writable: section?.writable ?? false,
      pending: this.pending,
    }
  }

  /** Publish the projected state, keeping the reference stable when nothing moved. */
  private publish(): void {
    const next = this.project()
    const current = this.snapshot
    if (next.interaction === current.interaction && next.appearance === current.appearance
      && next.writable === current.writable && next.pending === current.pending) return
    this.snapshot = next
    for (const listener of [...this.listeners]) listener()
  }
}

/**
 * Run one feature group while its switch is on: mounted on the flip to on,
 * torn down on the flip to off, and always disposed with the plugin.
 * @param ctx - the client root context the mount lives under.
 * @param model - the shared switch state.
 * @param field - the switch this group follows.
 * @param mount - builds the group now and returns its teardown.
 * @param label - effect label shown in fiber diagnostics.
 */
export function gateSwitch(
  ctx: ClientContext,
  model: FeatureSwitchModel,
  field: SwitchField,
  mount: () => () => void,
  label: string,
): void {
  ctx.effect(() => {
    let off: (() => void) | undefined
    const sync = (): void => {
      const on = model.enabled(field)
      if (on === (off !== undefined)) return
      if (!on) {
        const stop = off
        off = undefined
        stop?.()
        return
      }
      off = mount()
    }
    const unsubscribe = model.subscribe(sync)
    sync()
    return () => {
      unsubscribe()
      off?.()
      off = undefined
    }
  }, label)
}
