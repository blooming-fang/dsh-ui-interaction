/**
 * Sidebar "New Session" primary CTA. The sidebar's New Session button ships as a
 * neutral surface button — canvas fill (`--dsw-alias-button-elevated-fill`), a
 * one-pixel hairline, ink label — which reads as one more row next to the panel
 * list rather than as the column's primary action. This layer paints it with the
 * composer's send button palette instead: the coral `button-info-fill` as the
 * fill, white as the label, and `button-info-hover` on hover.
 *
 * Both surfaces therefore read from the same two tokens, so the theme stays the
 * single source of the color and a future re-tint moves both together.
 *
 * Scope: the expanded column only. In the collapsed rail the same button is a
 * 36x36 borderless icon button (`…_collapsed` on the sidebar root), where a
 * coral block would be a heavy dot; the rail keeps its own treatment.
 *
 * Pure presentation: no data, no slots, no commands, nothing model-visible.
 */

/** The plugin's own element namespace, matching the other surfaces. */
const PLUGIN_ID = 'dsh-ui-interaction'

/** id stamped onto the injected <style> so the loader can find plugin-owned css. */
const STYLE_ID = PLUGIN_ID + '/sidebar-cta'

/**
 * The button, matched by its stable `_newSession` class suffix (the hashed
 * module prefix changes per build), minus the collapsed rail. The
 * `body`-anchored selector plus the `:not()` keep specificity above
 * ui-sidebar's own platform and rail rules without resorting to `!important`.
 */
const BUTTON = 'body [class$="_newSession"]:not([class*="_collapsed"] *)'

export const SIDEBAR_CTA_CSS = [
  BUTTON + ' {',
  /* Same fill as the composer's send button. */
  '  background: var(--dsw-alias-button-info-fill);',
  '  border-color: transparent;',
  /* The send button pairs the coral with white; keep the pair identical. */
  '  color: #ffffff;',
  '}',
  BUTTON + ':hover {',
  '  background: var(--dsw-alias-button-info-hover);',
  '}',
  /* The shortcut chip sits inside the label at hover; on coral it needs the
     same white ink rather than the tertiary label color. */
  BUTTON + ' [class$="_newSessionShortcut"] {',
  '  color: #ffffff;',
  '}',
  '',
].join('\n')

/**
 * Mount the New Session CTA restyle.
 * @returns a disposer that removes the style tag.
 */
export function applySidebarCta(): () => void {
  if (document.querySelector('style[data-plugin-css=' + JSON.stringify(STYLE_ID) + ']') !== null) return () => {}
  const style = document.createElement('style')
  style.dataset.plugin = PLUGIN_ID
  style.dataset.pluginCss = STYLE_ID
  style.textContent = SIDEBAR_CTA_CSS
  document.head.append(style)
  return () => { style.remove() }
}
