/**
 * Warm-paper appearance theme: a single design-token palette (coral brand on a
 * warm cream canvas, with matching dark surfaces) folded into the ui-theme
 * token layer, so the whole GUI re-skins without touching any component.
 *
 * Seam: the ui-theme plugin owns the `--dsw-*` token sheets and the color
 * authority; third parties stack alias overrides through `ctx.theme`
 * (`overrideTokens(source, { light, dark })`). The platform presenter writes
 * the composed snapshot onto the body as inline custom properties, which is
 * why every literal here is a plain color/value string and why the layer
 * composes under both color schemes at once instead of replacing the user's
 * light/dark preference.
 *
 * Two halves:
 * - `applyThemeTokens` — the color layer through `ctx.theme.overrideTokens`.
 *   Values are per-scheme pairs, so one registration covers light and dark.
 * - `applyThemeStyle` — a stylesheet for the parts the token layer cannot
 *   express: `:root`-level default font stacks (the user's own font
 *   preferences still win, since ui-theme places them ahead of these
 *   defaults), the corner-radius scale, and the editorial serif on markdown
 *   headings.
 *
 * Pure presentation: no data, no slots, no commands, nothing model-visible.
 */

/** One alias token's value in each color scheme. */
export interface ThemeTokenPair {
  light: string
  dark: string
}

/** The slice of the ui-theme service surface this module drives. */
export interface ThemeTokenHost {
  /** Stack a token layer over the active theme; returns a disposer for exactly that layer. */
  overrideTokens(source: string, tokens: Record<string, ThemeTokenPair>): () => void
}

/** Style-tag namespace shared with the plugin's other chrome modules. */
const PLUGIN_ID = 'dsh-ui-interaction'

/** Layer identity handed to the theme service — one override layer per source. */
const THEME_SOURCE = PLUGIN_ID

/** id stamped onto the injected <style> so the loader can find plugin-owned css. */
const STYLE_ID = PLUGIN_ID + '/theme'

/**
 * Light-theme palette — the design system's warm paper surfaces. The ink /
 * body / muted ladder is the text scale; surface-soft and surface-card are the
 * two cream steps everything raised sits on; primary is the coral accent with
 * its active and disabled partners.
 */
const L = {
  primary: '#cc785c',
  primaryActive: '#a9583e',
  primaryDisabled: '#e3dacb',
  ink: '#141413',
  body: '#3d3d3a',
  bodyStrong: '#252523',
  muted: '#6c6a64',
  mutedSoft: '#857f74',
  hairline: '#dfd5c5',
  hairlineSoft: '#e6ddcd',
  canvas: '#f5f0e4',
  surfaceSoft: '#efe9db',
  surfaceCard: '#e9e1d1',
  surfaceCreamStrong: '#e1d7c4',
  onPrimary: '#ffffff',
  onDark: '#faf9f5',
  onDarkSoft: '#a09d96',
  accentTeal: '#5db8a6',
  accentAmber: '#e8a55a',
  success: '#5db872',
  warning: '#d4a017',
  error: '#c64545',
} as const

/**
 * Dark-theme palette — the design system's warm charcoal surfaces. The accent
 * stays coral (it reads at 5.5:1 on the charcoal canvas); the muted text step
 * is lifted so the same ladder keeps its contrast; the coral-light tone covers
 * accents that need to sit `on` the dark canvas rather than on a fill.
 */
const D = {
  primary: '#cc785c',
  primaryActive: '#db8d70',
  primaryLight: '#e0997c',
  primaryDisabled: '#3f3a33',
  ink: '#efebe4',
  body: '#a8a49c',
  bodyStrong: '#f4f1ea',
  muted: '#918d84',
  mutedSoft: '#7b776f',
  hairline: '#f4f1ea1f',
  hairlineSoft: '#f4f1ea12',
  canvas: '#1e1c18',
  surfaceSoft: '#26231e',
  surfaceCard: '#2c2924',
  surfaceElevated: '#35312a',
  surfaceCreamStrong: '#3b352d',
  onPrimary: '#181715',
  onDark: '#faf9f5',
  onDarkSoft: '#a09d96',
  accentTeal: '#6cc4b2',
  accentAmber: '#e8a55a',
  success: '#6cc07f',
  warning: '#e8a55a',
  error: '#e08080',
} as const

/** Shorthand for one per-scheme token value. */
function pair(light: string, dark: string): ThemeTokenPair {
  return { light, dark }
}

/**
 * The alias-token layer — one line per surface the palette re-colors. Every
 * name is a live token in the ui-theme sheets; values are literal colors (or
 * color-mix expressions over literals) so no consumer's own variables leak in.
 * Exported as the palette's single source of truth.
 */
export const THEME_TOKENS: Readonly<Record<string, ThemeTokenPair>> = {
  // --- page and raised surfaces -------------------------------------------
  '--dsw-alias-bg-base': pair(L.canvas, D.canvas),
  '--dsw-alias-bg-layer-1': pair(L.canvas, D.surfaceSoft),
  '--dsw-alias-bg-layer-2': pair(L.surfaceSoft, D.surfaceCard),
  '--dsw-alias-bg-layer-3': pair(L.surfaceCard, D.surfaceElevated),
  '--dsw-alias-bg-overlay': pair(L.canvas, D.surfaceCard),
  '--dsw-alias-bg-module-platform': pair(L.surfaceSoft, D.surfaceCard),
  '--dsw-alias-bg-multi-select': pair(L.surfaceSoft, D.surfaceCard),
  '--dsw-alias-bg-document-preview': pair(L.surfaceSoft, D.canvas),
  '--dsw-alias-bg-skeleton': pair('#1414130a', '#faf9f514'),
  '--dsw-alias-bg-document-selection': pair(
    'color-mix(in srgb, ' + L.primary + ' 28%, transparent)',
    'color-mix(in srgb, ' + L.primary + ' 34%, transparent)',
  ),
  '--dsw-alias-bg-mask-1': pair('#1414133d', '#14141380'),
  '--dsw-alias-bg-mask-2': pair('#1414131f', '#14141333'),
  '--dsw-alias-bg-mask-3': pair('#1414137a', '#1414137a'),
  '--dsw-alias-bg-mask-photo': pair('#141413e0', '#141413e0'),
  '--dsw-alias-bg-mask-drop': pair('#f5f0e4b3', '#2c2924b3'),

  // --- hairlines ----------------------------------------------------------
  '--dsw-alias-border-l1': pair(L.hairlineSoft, D.hairlineSoft),
  '--dsw-alias-border-l2': pair(L.hairline, D.hairline),
  '--dsw-alias-border-l2-darkmode-thin': pair(L.hairline, D.hairlineSoft),
  '--dsw-alias-border-l3': pair('#d6c9b4', '#f4f1ea2b'),
  '--dsw-alias-border-l4': pair('#c9baa2', '#f4f1ea36'),
  '--dsw-alias-border-inverted': pair('transparent', '#f4f1ea0f'),
  '--dsw-alias-border-inverted2': pair('transparent', '#f4f1ea14'),

  // --- text ladder --------------------------------------------------------
  '--dsw-alias-label-primary': pair(L.ink, D.ink),
  '--dsw-alias-label-primary-dimmed': pair(L.bodyStrong, D.bodyStrong),
  '--dsw-alias-label-primary-bluish': pair(L.ink, D.ink),
  '--dsw-alias-label-primary-foreground': pair(L.onPrimary, D.onPrimary),
  '--dsw-alias-label-primary-inverted': pair(L.onDark, D.surfaceCard),
  '--dsw-alias-label-secondary': pair(L.body, D.body),
  '--dsw-alias-label-tertiary': pair(L.muted, D.muted),
  '--dsw-alias-label-caption': pair(L.mutedSoft, D.mutedSoft),
  '--dsw-alias-label-dimmed': pair(L.hairlineSoft, '#474139'),
  '--dsw-alias-label-shimmer': pair(
    'color-mix(in srgb, ' + L.ink + ' 30%, transparent)',
    'color-mix(in srgb, ' + L.onDark + ' 45%, transparent)',
  ),
  '--dsw-alias-label-deep-diving': pair(L.primaryActive, D.primaryLight),
  '--dsw-alias-label-deep-diving-shimmer': pair('#cc785c66', '#cc785c99'),
  '--dsw-alias-label-document-preview': pair(L.muted, D.body),
  '--dsw-alias-menu-icon': pair(L.body, D.bodyStrong),

  // --- brand and buttons --------------------------------------------------
  '--dsw-alias-brand-primary': pair(L.primary, D.primary),
  '--dsw-alias-brand-primary-invert': pair(L.ink, D.ink),
  '--dsw-alias-brand-text': pair(L.ink, D.ink),
  '--dsw-alias-brand-primary-new-colorprimary-new-color': pair(L.primary, D.primaryLight),
  '--dsw-alias-button-primary-fill': pair(L.primary, D.primary),
  '--dsw-alias-button-primary-hover': pair(L.primaryActive, D.primaryActive),
  '--dsw-alias-button-primary-dimmed': pair(L.primaryDisabled, D.primaryDisabled),
  '--dsw-alias-button-contrast-fill': pair(L.bodyStrong, D.onDark),
  '--dsw-alias-button-elevated-fill': pair(L.canvas, D.surfaceElevated),
  '--dsw-alias-button-floating-fill': pair(L.canvas, D.surfaceCard),
  '--dsw-alias-button-floating-hover': pair(L.surfaceSoft, D.surfaceElevated),
  '--dsw-alias-button-ghost-active-fill': pair(L.surfaceCard, D.surfaceCard),
  '--dsw-alias-button-ghost-active-hover': pair(L.surfaceCreamStrong, D.surfaceCreamStrong),
  '--dsw-alias-button-ghost-active-border': pair(L.mutedSoft, '#7a766e'),
  '--dsw-alias-button-info-fill': pair(L.primary, D.primary),
  '--dsw-alias-button-info-hover': pair(L.primaryActive, D.primaryActive),
  '--dsw-alias-button-tool-bar-fill': pair('#3d393680', '#3d393699'),
  '--dsw-alias-button-tool-bar-fill-invisible': pair('#3d39365c', '#3d39365c'),
  '--dsw-alias-button-tool-bar-hover': pair('#3d393699', '#3d3936b3'),

  // --- interaction washes -------------------------------------------------
  '--dsw-alias-interactive-bg-hover': pair('#1414130c', '#f4f1ea14'),
  '--dsw-alias-interactive-bg-active': pair('#14141318', '#f4f1ea24'),
  '--dsw-alias-interactive-bg-hover-accent': pair('#cc785c1f', '#cc785c33'),
  '--dsw-alias-interactive-bg-hover-danger': pair('#c645451a', '#e0808029'),
  '--dsw-alias-interactive-bg-hover-solid': pair(L.surfaceSoft, D.surfaceElevated),

  // --- semantic states ----------------------------------------------------
  '--dsw-alias-state-business-primary': pair(L.primary, D.primaryLight),
  '--dsw-alias-state-business-tertiary': pair('#f2ded1', '#35261f'),
  '--dsw-alias-state-error-primary': pair(L.error, D.error),
  '--dsw-alias-state-error-secondary': pair('#d98080', L.error),
  '--dsw-alias-state-idle-primary': pair('#c8bca6', '#5b564d'),
  '--dsw-alias-state-success-primary': pair(L.success, D.success),
  '--dsw-alias-state-success-secondary': pair('#8ecf9b', '#4a9e5c'),
  '--dsw-alias-state-success-tertiary': pair('#e2edd9', '#22301f'),
  '--dsw-alias-state-warn-label': pair('#a6790d', L.warning),
  '--dsw-alias-state-warn-primary': pair(L.warning, D.warning),
  '--dsw-alias-state-warn-secondary': pair(L.accentAmber, '#c98f3a'),
  '--dsw-alias-state-warn-tertiary': pair('#f6edd8', '#332a18'),
  '--dsw-alias-link': pair('#a4522f', D.primaryLight),

  // --- markdown and code --------------------------------------------------
  '--dsw-alias-markdown-code-block': pair(L.surfaceSoft, D.surfaceSoft),
  '--dsw-alias-markdown-code-block-banner': pair(L.surfaceCard, D.surfaceCard),
  '--dsw-alias-markdown-inline-code': pair(L.surfaceCard, '#2f2b25'),
  '--dsw-alias-markdown-citation': pair(L.surfaceSoft, D.surfaceCard),
  '--dsw-alias-markdown-tag': pair(L.surfaceCard, D.surfaceElevated),
  '--dsw-alias-markdown-placeholder': pair(L.hairlineSoft, D.surfaceCard),
  '--dsw-alias-markdown-code-segment-selected': pair(L.canvas, D.surfaceElevated),
  '--dsw-alias-markdown-code-segment-unselected': pair(L.surfaceSoft, D.surfaceSoft),
  '--dsw-alias-turn-trigger-bg': pair(L.surfaceSoft, D.surfaceCard),
  '--dsw-alias-turn-trigger-bg-hover': pair(L.surfaceCard, D.surfaceElevated),
  '--dsw-alias-code-diff-added': pair('#5db87214', '#6cc07f1f'),
  '--dsw-alias-code-diff-deleted': pair('#c6454514', '#e080801f'),
  '--dsw-alias-file-diff-added-bg': pair('#e6eedb', '#1e2a20'),
  '--dsw-alias-file-diff-added-gutter': pair('#edf3e6', '#182019'),
  '--dsw-alias-file-diff-added-marker': pair('#4c9a5f', '#6cc07f'),
  '--dsw-alias-file-diff-deleted-bg': pair('#f6e3dc', '#33211d'),
  '--dsw-alias-file-diff-deleted-gutter': pair('#f9ede7', '#281a17'),
  '--dsw-alias-file-diff-deleted-marker': pair('#bf5a44', '#e0806a'),

  // --- feature surfaces (sidebar, bubbles, composer, menus) ---------------
  '--dsw-specific-sidebar-fill': pair(L.surfaceSoft, D.surfaceSoft),
  '--dsw-specific-bubble': pair(L.surfaceCard, D.surfaceCard),
  '--dsw-specific-bubble-highlight': pair(L.surfaceCreamStrong, D.surfaceElevated),
  '--dsw-specific-input-major': pair(L.surfaceSoft, D.surfaceCard),
  '--dsw-specific-login-input': pair('#f4eee1', D.surfaceCard),
  '--dsw-specific-selector': pair('#ece4d5', '#302c26'),
  '--dsw-specific-tip': pair(L.surfaceSoft, D.surfaceCard),
  '--dsw-specific-sidebar-nav-item-active': pair(L.surfaceCard, D.surfaceElevated),
  '--dsw-specific-sidebar-nav-item-active-accent': pair(L.surfaceCreamStrong, D.primaryDisabled),
  '--dsw-specific-sidebar-nav-item-hover': pair('#ece4d5', '#2e2a24'),
  '--dsw-menu-surface-fill': pair('#f7f2e6e8', '#2c2924d9'),
  '--dsw-alias-menu-group-header-fill': pair('#f0eaddf0', '#282520f0'),
  '--dsw-alias-settings-card-fill': pair(L.surfaceCard, D.surfaceCard),
  '--dsw-alias-settings-card-stroke': pair(L.hairline, '#f4f1ea2b'),

  // --- affordances --------------------------------------------------------
  '--dsw-alias-scrollbar-bg-l1': pair(L.hairline, D.primaryDisabled),
  '--dsw-alias-scrollbar-bg-l2': pair('#d3c6b0', '#43403a'),
  '--dsw-alias-scrollbar-hover-l1': pair('#cabc9f', '#4a463f'),
  '--dsw-alias-scrollbar-hover-l2': pair('#c3b49c', '#54504a'),
  '--dsw-alias-switch-thumb': pair('#ffffff', L.mutedSoft),
  '--dsw-alias-toast-bg': pair('#181715', '#35312a'),
  '--dsw-alias-toast-label': pair(L.onDark, L.onDark),
  '--dsw-alias-tooltip-bg': pair(L.bodyStrong, D.surfaceElevated),
  '--dsw-alias-tooltip-key-bg': pair('#3a3733', '#464038'),
  '--dsw-alias-onboarding-accent': pair(L.primary, D.primaryLight),
  '--dsw-alias-onboarding-card-fill': pair('#f7f2e6cc', '#2c2924cc'),
  '--dsw-alias-onboarding-secondary-fill': pair(L.canvas, D.surfaceElevated),
  '--dsw-alias-onboarding-checkbox-border': pair('#14141333', '#faf9f533'),

  // --- elevation: warm ink, kept faint (the system is color-block first,
  // shadow rare: depth comes from the cream-versus-dark surface contrast) ---
  '--dsw-shadow-lv1': pair('0 1px 3px 0 #14141314', '0 1px 3px 0 #00000059'),
  '--dsw-shadow-lv1-blur': pair('0 4px 12px 0 #1414130f', '0 4px 12px 0 #0000004d'),
  '--dsw-shadow-lv2': pair(
    '0 1px 3px 0 #14141314, 0 4px 12px 0 #14141314',
    '0 1px 3px 0 #00000059, 0 4px 12px 0 #0000004d',
  ),
  '--dsw-shadow-lv3': pair(
    '0 0 1px 0 #1414131f, 0 8px 24px 0 #1414131f',
    '0 0 1px 0 #00000080, 0 8px 24px 0 #00000080',
  ),

  // --- thinking gradients (painted over the canvas, so they follow it) ----
  '--dsw-linear-gradient-think': pair(
    'linear-gradient(180deg, ' + L.canvas + ' 20.19%, ' + L.canvas + '00 100%)',
    'linear-gradient(180deg, ' + D.canvas + ' 20.19%, ' + D.canvas + '00 100%)',
  ),
  '--dsw-linear-think-select': pair(
    'linear-gradient(180deg, ' + L.surfaceSoft + ' 20.19%, ' + L.surfaceSoft + '00 100%)',
    'linear-gradient(180deg, ' + D.surfaceCard + ' 20.19%, ' + D.surfaceCard + '00 100%)',
  ),
}

/**
 * The stylesheet half: `html:root` deliberately outranks ui-theme's own
 * `:root` declarations so the plugin does not depend on style-tag order, while
 * still sitting *behind* the user's font preferences (ui-theme composes
 * `--dsw-font-family` as the user's list, then these defaults, so a chosen
 * font keeps winning).
 */
/** Display serif stack: Copernicus / Tiempos Headline, then the open-source
 *  stand-ins the design system names (Cormorant Garamond, EB Garamond), then the
 *  CJK serif faces so Chinese headings keep the editorial voice. */
const DISPLAY_FAMILY = '"Copernicus", "Tiempos Headline", "Cormorant Garamond", "EB Garamond", Garamond, "Times New Roman", "Songti SC", "Noto Serif CJK SC", "Noto Serif SC", SimSun, serif'

/** Humanist sans stack: StyreneB, with Inter as the documented substitute. */
const TEXT_FAMILY = '"StyreneB", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif'

/** Monospace stack for code and terminals. */
const CODE_FAMILY = '"JetBrains Mono", "SF Mono", "Fira Code", Consolas, "Liberation Mono", Menlo, "PingFang SC", "Microsoft YaHei", monospace'

export const THEME_CSS = [
  'html:root {',
  '  /* Typography: the editorial split of the design system — humanist sans for',
  '     interface and prose, monospace for code, display serif for headings and',
  '     brand text. Each list falls through to platform faces (CJK ones included),',
  '     so text never drops to a bare generic. */',
  '  --dsh-font-family-text-default: ' + TEXT_FAMILY + ';',
  '  --dsh-font-family-code-default: ' + CODE_FAMILY + ';',
  '  --dsw-font-family-brand: ' + DISPLAY_FAMILY + ';',
  '  /* Corner radius scale of the design system, one step tighter than the',
  '     platform default so surfaces keep the crisp printed feel. */',
  '  --dsw-radius-xs: 4px;',
  '  --dsw-radius-sm: 6px;',
  '  --dsw-radius-md: 8px;',
  '  --dsw-radius-lg: 12px;',
  '  --dsw-radius-xl: 16px;',
  '  --dsw-radius-panel: 16px;',
  '}',
  '/* Markdown headings carry the display serif plus the two rules that keep it',
  '   editorial: weight 400 (the display face never bolds) and negative tracking',
  '   that tightens as the size grows. data-chat-flow is the stable chat-column',
  '   hook, so this holds across builds without naming any hashed class. */',
  '[data-chat-flow] h1,',
  '[data-chat-flow] h2,',
  '[data-chat-flow] h3,',
  '[data-chat-flow] h4 {',
  '  font-family: ' + DISPLAY_FAMILY + ';',
  '  font-weight: 400;',
  '  letter-spacing: -0.3px;',
  '}',
  '[data-chat-flow] h1 { letter-spacing: -1px; }',
  '[data-chat-flow] h2 { letter-spacing: -0.5px; }',
  '',
].join('\n')

/**
 * Stack the palette over whatever theme the user picked.
 * @param theme - the ui-theme service surface.
 * @returns a disposer removing exactly this token layer.
 */
export function applyThemeTokens(theme: ThemeTokenHost): () => void {
  return theme.overrideTokens(THEME_SOURCE, THEME_TOKENS)
}

/**
 * Inject the stylesheet half (fonts, radii, heading faces).
 * @returns a disposer that removes the style tag.
 */
export function applyThemeStyle(): () => void {
  if (document.querySelector('style[data-plugin-css=' + JSON.stringify(STYLE_ID) + ']') !== null) return () => {}
  const style = document.createElement('style')
  style.dataset.plugin = PLUGIN_ID
  style.dataset.pluginCss = STYLE_ID
  style.textContent = THEME_CSS
  document.head.append(style)
  return () => { style.remove() }
}
