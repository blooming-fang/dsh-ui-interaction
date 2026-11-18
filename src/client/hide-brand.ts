/**
 * Hide a brand block that belongs to ANOTHER plugin.
 *
 * ds-bot renders its own sidebar top bar and paints "DS Bot" into it as
 * `<span class="bt-brand">` (its `bt-*` class namespace is plain, not hashed,
 * so the class itself is the stable hook). This bundle hides that one element —
 * the class token `bt-brand` exactly, so sibling tokens such as
 * `bt-brand-whale` are left alone.
 *
 * Precedence is deliberately the highest this bundle uses: the owner ships
 * `.bt-brand{display:inline-flex}` and `.bt-side-top .bt-brand{…}`, and a
 * later-loaded plugin could add more, so the rule carries `!important` AND a
 * padded selector (`:root` repeated three times plus `body`, specificity
 * (0,4,1)). Specificity alone would not be safe — an owner rule with
 * `!important` at lower specificity still loses to ours, which is the point.
 * The one thing it cannot beat is an INLINE `style="display:…!important"`,
 * which no stylesheet can override; the owner does not set inline display.
 *
 * Pure CSS, like the other presentation layers: the element is hidden, never
 * removed, so React reconciliation cannot re-create it and no owner state is
 * touched. No data, no slots, nothing model-visible.
 */

/** The plugin's own element namespace, matching the other surfaces. */
const PLUGIN_ID = 'dsh-ui-interaction'

/** id stamped onto the injected <style> so the loader can find plugin-owned css. */
const STYLE_ID = `${PLUGIN_ID}/hide-foreign-brand`

/**
 * The foreign class to hide, matched as a whole class token (`.bt-brand`), so
 * `bt-brand-whale` and any other `bt-*` neighbour stay visible.
 */
const FOREIGN_BRAND_CLASS = 'bt-brand'

/**
 * Global stylesheet: hide the foreign brand block at the highest precedence
 * this bundle uses. `:root` is repeated to pad specificity deliberately.
 */
const GLOBAL_CSS = `
:root:root:root body .${FOREIGN_BRAND_CLASS} {
  display: none !important;
}
`

/**
 * Mount the foreign-brand hide by injecting its stylesheet.
 * @returns a disposer that removes the stylesheet.
 */
export function applyForeignBrandHiding(): () => void {
  const style = document.createElement('style')
  style.dataset.plugin = PLUGIN_ID
  style.dataset.pluginCss = STYLE_ID
  style.textContent = GLOBAL_CSS
  document.head.append(style)
  return () => { style.remove() }
}
