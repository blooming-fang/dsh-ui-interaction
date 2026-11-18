/**
 * Model selection plugin (bundle), browser half — TWO entries over ONE
 * per-session directory owned by ModelDirectoryResolver (`ctx.modelDirectories`).
 * The /model popupSelect contribution and the composer's named
 * `conversation.input.model` seat both load the same session directory
 * (Host-generation model catalog + this session's `modelSelection` projection)
 * and submit through `session.selectModel` via the same directory instance, so
 * the host-reported current selection is the single fact both surfaces echo —
 * a switch made in either entry is what the other shows next. Failures ride
 * each entry's own retry surface (popup shell error/retry; seat menu inline
 * error) without forking the state. Addressed subagent sessions expose neither
 * entry because those Agent-bound RPCs would activate persisted history
 * outside the direct-parent continuation path.
 *
 * Alongside the model picker, the plugin re-skins the GUI with its own
 * appearance theme (`theme.ts`): a warm-paper design-token palette stacked onto
 * the ui-theme alias layer through `ctx.theme.overrideTokens`, with its
 * typography and radius scale carried by a plugin-owned stylesheet. A further
 * stylesheet (`sidebar-panels.ts`) folds the sidebar's global panel list into a
 * two-column grid so the workspace list keeps the height. A motion layer
 * (`motion.ts`) finally gives hover/focus states a base transition, which the
 * product itself almost never declares.
 *
 * Everything is grouped behind two switches (`switches.ts`), stored in this
 * package's own profile entry config and rendered as a card on the bundle's page
 * in the Plugins page: "interaction" carries the model surfaces, the sidebar
 * grid and CTA, the motion layer and the brand retouch; "appearance" carries the
 * palette and the composer ring. Each group mounts and tears down live on a
 * flip, and both default to on, so an install with no written section behaves
 * exactly like the previous release.
 */
// Type-only: the selection shape both entries submit.
import type { ModelSelection } from '@deepseek-ai/dsh-api-session-controller/types'
// Type-only: the client root context (ctx.locale / ctx.inject / ctx.remote).
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { CommandUiContract, SelectOption } from '@deepseek-ai/dsh-client-ui-commands/client'
// Type-only: pulls the ui-conversation SlotMap merge (the input.model seat).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls the ui-renderer client merge (ctx.slots — the registry that
// owns every slot declaration, including the composer model seat).
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import type { ModelDirectoryState } from './directory.ts'
import { descriptionOf, rowId } from './describe.ts'
import { ModelDirectoryResolver } from './service.ts'
import type { ModelSelectInjected } from './slots.ts'
import { ModelSelect } from './ModelSelect.tsx'
import { applyThemeStyle, applyThemeTokens, type ThemeTokenHost } from './theme.ts'
import { applySidebarPanelGrid } from './sidebar-panels.ts'
import { applySidebarCta } from './sidebar-cta.ts'
import { applyComposerFrame } from './composer-frame.ts'
import { applyDshBranding } from './branding.ts'
import { applyForeignBrandHiding } from './hide-brand.ts'
import { applyMotion } from './motion.ts'
import { FeatureSwitches } from './FeatureSwitches.tsx'
import {
  FeatureSwitchModel, gateSwitch, SWITCHES_NAMESPACE, type ConfigFormsFace,
} from './switches.ts'
import {
  en, switchesEn, switchesZh, zh, type ModelKey, type SwitchesKey, SWITCHES_LOCALE_NS,
} from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The model selection surfaces' copy (/model popup + composer seat). */
    model: ModelKey
    /** The bundle's switch card copy on the Plugins page. */
    'settings.interaction': SwitchesKey
  }
}

/** Flatten the directory into popup rows; failure rows are listed for visibility but never selectable. */
function optionsOf(directory: ModelDirectoryState, t: TranslateNS<'model'>): SelectOption[] {
  const rows: SelectOption[] = []
  for (const group of directory.groups) {
    for (const model of group.models) {
      const description = descriptionOf(group.id, model, t)
      rows.push({
        id: rowId(group.id, model.id),
        label: model.name,
        detail: description !== undefined ? `${group.name} · ${description}` : group.name,
        ...(directory.current !== null && directory.current.provider === group.id && directory.current.model === model.id
          ? { active: true } : {}),
      })
    }
  }
  for (const failure of directory.failures) {
    rows.push({
      id: `failure/${failure.id}`,
      label: failure.name,
      detail: t('option.loadError', { message: failure.message }),
    })
  }
  return rows
}

/**
 * Resolve a picked row back to its model selection by matching against the loaded
 * groups (the same data the rows were built from — ids stay opaque).
 * @param state - the session's directory snapshot.
 * @param id - the picked row id.
 * @returns the row's model selection, or undefined for failure rows / stale ids.
 */
function selectionOf(state: ModelDirectoryState, id: string): ModelSelection | undefined {
  for (const group of state.groups) {
    for (const model of group.models) {
      if (rowId(group.id, model.id) !== id) continue
      const sameRoute = state.current?.provider === group.id && state.current.model === model.id
      const reasoningEffort = sameRoute
        ? state.current?.reasoningEffort ?? model.reasoning?.defaultEffort
        : model.reasoning?.defaultEffort
      return {
        provider: group.id,
        model: model.id,
        ...reasoningEffort === undefined ? {} : { reasoningEffort },
      }
    }
  }
  return undefined
}

/** Dictionary namespace owned by this plugin. */
const NS = 'model'

/** Required services: the contribution registry, the seat's slot registry, locale, and the service's own faces. */
export const inject = ['commandUi', 'locale', 'sessions', 'slots', 'remote', 'remote.session']

/**
 * Client plugin body: mount ModelDirectoryResolver, register the `model`
 * dictionaries, then register the /model popup contribution and the composer
 * model seat over the service.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-ui-interaction: dictionaries')
  ctx.effect(
    () => ctx.locale.register(SWITCHES_LOCALE_NS, { zh: switchesZh, en: switchesEn }),
    'dsh-ui-interaction: switch dictionaries',
  )

  // Non-slot faces (the command description, the popup option builder) read
  // through the bound translate; the seat component reads the standard seat.
  const t = ctx.locale.bind(NS)

  // ── feature switches ────────────────────────────────────────────────────────
  // One shared state: the card renders it, both groups follow it. The Host form
  // is attached when the settings service arrives — a Host that serves none (or
  // an older dsh) leaves every switch at its default, which is on, so the
  // features stay live rather than disappearing behind a missing service.
  const switches = new FeatureSwitchModel()
  ctx.effect(() => () => { switches.dispose() }, 'dsh-ui-interaction: switch state')
  ctx.inject(['configForms'], (scope: ClientContext) => {
    const forms = scope.get('configForms') as ConfigFormsFace | undefined
    if (forms === undefined) return
    switches.bind(forms.get(SWITCHES_NAMESPACE))
    scope.effect(() => () => { switches.unbind() }, 'dsh-ui-interaction: switch source')
  })

  // The card itself always renders: it is how the switches are reached, and it
  // stays meaningful when the Host document is read-only (the rows go disabled).
  ctx.effect(() => ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
    name: 'plugins.bundle.config',
    key: 'dsh-ui-interaction',
    locale: SWITCHES_LOCALE_NS,
    inject: () => ({ switches }),
  }, FeatureSwitches)), 'dsh-ui-interaction: switch card')

  // ── group 1: interaction and structure ──────────────────────────────────────
  // Model surfaces (both entries over the one per-session directory, plus the
  // service they share), the sidebar panel grid and CTA, the motion layer and
  // the brand retouch. Teardown runs in reverse: the two consumers leave before
  // the service they read.
  gateSwitch(ctx, switches, 'interaction', () => {
    const stops: (() => void)[] = []

    // Sidebar panel grid: the global panel rows (插件 / Superagent / 自动化任务 /
    // 我的工作台 / 更多) pack two per row in the expanded column, returning their
    // height to the workspace list. Pure CSS over stable class fragments; the
    // collapsed rail is untouched.
    stops.push(ctx.effect(() => applySidebarPanelGrid(), 'dsh-ui-interaction: sidebar panel grid'))

    // Sidebar New Session CTA: repaint the column's primary action with the
    // composer send button's coral palette, so the two calls to action carry the
    // same two tokens. Pure CSS over the stable _newSession class suffix.
    stops.push(ctx.effect(() => applySidebarCta(), 'dsh-ui-interaction: sidebar new-session cta'))

    // Motion layer: the product declares a transition on barely 12% of its
    // state-changing rules, so hover and focus swap colour in a single frame.
    // This adds the missing base for colour, elevation and opacity only —
    // geometry is never touched, and every selector sits in :where() so any
    // component's own motion (or its "no transitions while dragging" switch)
    // still wins. It also mutes itself while ui-theme commits a palette swap, so
    // switching light/dark stays an instant re-colour instead of a page fade.
    stops.push(ctx.effect(() => applyMotion(ctx), 'dsh-ui-interaction: motion layer'))

    // Branding retouch: drop the whale/fish logos and present the sidebar brand
    // without one. Pure decorative chrome.
    stops.push(ctx.effect(() => applyDshBranding(), 'dsh-ui-interaction: brand retouch'))

    // Foreign brand block: ds-bot paints its own "DS Bot" chip into its sidebar
    // top bar as `.bt-brand`. Hidden at the highest precedence this bundle uses
    // (padded `:root` selector + !important), because the owner ships its own
    // rules for that class and load order must not decide who wins.
    stops.push(ctx.effect(() => applyForeignBrandHiding(), 'dsh-ui-interaction: foreign brand hiding'))

    // The per-session directory service both model entries read. The composer
    // block reason is this plugin's own copy, read at raise time so a locale
    // change reaches the next publish.
    const resolver = ctx.plugin(ModelDirectoryResolver, { blockReason: () => t('blocked.composer') })
    stops.push(() => { void resolver.dispose() })

    // Entry 1: the /model popupSelect over the shared directory. The description
    // is resolved per candidate pass, so a locale change reaches the next pass.
    const command = ctx.inject(['commandUi', 'modelDirectories'], (scope: ClientContext) => {
      const commandUi = scope.get('commandUi') as CommandUiContract
      const models = scope.modelDirectories
      const sessions = scope.sessions
      scope.effect(() => commandUi.register({
        name: 'model',
        description: () => t('command.description'),
        available: session => sessions.subagentAddress(session.sessionId) === undefined,
        ui: {
          kind: 'popupSelect',
          options: async (session) => {
            if (sessions.subagentAddress(session.sessionId) !== undefined) {
              throw new Error('model selection is unavailable for addressed subagent sessions')
            }
            return optionsOf(await models.directoryFor(session.sessionId).load(), t)
          },
          onSelect: async (option, session) => {
            if (sessions.subagentAddress(session.sessionId) !== undefined) {
              throw new Error('model selection is unavailable for addressed subagent sessions')
            }
            const directory = models.directoryFor(session.sessionId)
            const selection = selectionOf(directory.store.getSnapshot(), option.id)
            if (selection === undefined) {
              throw new Error('this provider\'s catalog failed to load — pick a model from a loaded group')
            }
            await directory.select(selection)
          },
        },
      }), 'dsh-ui-interaction: /model contribution')
    })
    stops.push(() => { void command.dispose() })

    // Entry 2: the composer's named model seat over the SAME directory.
    const seat = ctx.inject(['slots', 'modelDirectories'], (scope: ClientContext) => {
      const models = scope.modelDirectories
      const sessions = scope.sessions
      scope.slots.inject('conversation.input.model', () => scope.slots.register({
        name: 'conversation.input.model',
        locale: NS,
        children: {
          'conversation.input.model.options': { kind: 'list', scope: 'session' },
        },
        inject: (sessionId): ModelSelectInjected => {
          const directory = models.directoryFor(sessionId)
          const available = sessions.subagentAddress(sessionId) === undefined
          return {
            available,
            directory: directory.store,
            load: () => {
              if (available) directory.load().catch(() => { /* surfaced on the store */ })
            },
            select: (selection: ModelSelection) => available
              ? directory.select(selection).then(() => true, () => false)
              : Promise.resolve(false),
          }
        },
      }, ModelSelect))
    })
    stops.push(() => { void seat.dispose() })

    return () => { for (const stop of stops.reverse()) stop() }
  }, 'dsh-ui-interaction: interaction group')

  // ── group 2: appearance and palette ────────────────────────────────────────
  // The palette rides ui-theme's override layer (one per-scheme token layer,
  // disposed with the group), its typography and radius scale ride a
  // plugin-owned stylesheet, and the composer gains its ring. Pure presentation:
  // no data, no slots, nothing model-visible.
  gateSwitch(ctx, switches, 'appearance', () => {
    const stops: (() => void)[] = []

    stops.push(ctx.effect(() => applyThemeStyle(), 'dsh-ui-interaction: theme stylesheet'))

    const tokens = ctx.inject(['theme'], (scope: ClientContext) => {
      const theme = scope.get('theme') as ThemeTokenHost | undefined
      if (theme === undefined) return
      scope.effect(() => applyThemeTokens(theme), 'dsh-ui-interaction: theme tokens')
    })
    stops.push(() => { void tokens.dispose() })

    // Composer frame: the message input's edge is only a 0.5px hairline in the
    // same tone as its fill, which disappears on the warm-paper palette. This
    // adds a coral ring (outline, so no layout change) that deepens on focus.
    stops.push(ctx.effect(() => applyComposerFrame(), 'dsh-ui-interaction: composer frame'))

    return () => { for (const stop of stops.reverse()) stop() }
  }, 'dsh-ui-interaction: appearance group')
}
