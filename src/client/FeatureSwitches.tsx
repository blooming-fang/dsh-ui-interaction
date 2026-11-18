/**
 * The bundle's configuration card: two feature switches, rendered in the
 * Plugins page on this bundle's own page (`plugins.bundle.config`, keyed by
 * package name).
 *
 * The card is a view over {@link FeatureSwitchModel}: every switch reflects the
 * section the Host accepted, so a refused write snaps back on its own, and each
 * row is disabled while a write is in flight or when the Host document is
 * read-only.
 */
import { useSyncExternalStore } from 'react'
import { Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { SWITCH_FIELDS, type FeatureSwitchModel, type SwitchField } from './switches.ts'
import css from './FeatureSwitches.module.css'

/** The registration's injected face: the shared switch state and its writes. */
export interface FeatureSwitchesInjected {
  /** Shared switch state (also followed by every feature gate). */
  switches: FeatureSwitchModel
}

/** Composed props of the bundle configuration card. */
export type FeatureSwitchesProps = PropsRuntime<'plugins.bundle.config'>
  & PropsLocale<'settings.interaction'>
  & InjectFace<FeatureSwitchesInjected>

/**
 * Render one switch row.
 * @param props - the field, the switch state, the copy, and the write.
 * @returns the labelled row.
 */
function SwitchRow({ field, state, pending, writable, t, onToggle }: {
  readonly field: SwitchField
  readonly state: boolean
  readonly pending: SwitchField | undefined
  readonly writable: boolean
  readonly t: FeatureSwitchesProps['t']
  readonly onToggle: (next: boolean) => void
}) {
  const label = t(`${field}.label`)
  return (
    <div className={css.row} data-dsh-ui-interaction-switch={field}>
      <div className={css.rowCopy}>
        <div className={css.rowLabel}>{label}</div>
        <div className={css.rowHint}>{t(`${field}.hint`)}</div>
      </div>
      <Switch
        checked={state}
        disabled={!writable || pending !== undefined}
        label={label}
        onChange={onToggle}
      />
    </div>
  )
}

/**
 * Render the two feature switches.
 * @param props - the runtime share, the copy namespace, and the switch face.
 * @returns the configuration card.
 */
export function FeatureSwitches({ t, switches }: FeatureSwitchesProps) {
  const state = useSyncExternalStore(switches.subscribe, switches.getSnapshot)
  return (
    <div className={css.card}>
      <div className={css.head}>
        <div className={css.title}>{t('title')}</div>
        <div className={css.hint}>{t('description')}</div>
      </div>
      <div className={css.rows}>
        {SWITCH_FIELDS.map(field => (
          <SwitchRow
            key={field}
            field={field}
            state={state[field]}
            pending={state.pending}
            writable={state.writable}
            t={t}
            onToggle={(next) => { switches.set(field, next) }}
          />
        ))}
      </div>
    </div>
  )
}
