/**
 * Branding retouch for the neon-chrome profile: drop the DeepSeek whale/fish
 * logo marks while KEEPING the brand text.
 *
 * dsh 0.1.7 split branding into independent slots (`sidebar.brand.mark` /
 * `sidebar.brand.name`) and gave `BrandWordmark` an `includeMark` switch, so
 * the mark and the name are now separable. The shipped official brand package
 * (`@deepseek-ai/dsh-client-ui-brand-official`) fills the sidebar with
 * `FishLogo` for the mark slot and a mark-less wordmark for the name slot.
 * That means hiding the fish mark alone is now exactly "no logo, brand text
 * unchanged" — the whole-wordmark hide the 0.1.5 build needed is obsolete and
 * would have taken the brand text with it.
 *
 * Pure CSS so it survives React reconciliation — the svg is hidden, not
 * deleted, because deleting it lets React re-create it.
 *
 * Targets ride one stable DOM signature, never a hashed class prefix: the
 * `FishLogo` svg's `viewBox`, which is rendered from `FISH_LOGO_VIEWBOX`
 * (`{ width: 23.16, height: 17.04 }`) as a template literal and therefore
 * still lands in the DOM as the literal attribute `0 0 23.16 17.04`. That one
 * rule covers every fish mark: the sidebar brand mark slot (collapsed rail and
 * expanded header) and the conversation hero's animated fish.
 *
 * No data, no slots, nothing model-visible.
 */

/** The plugin's own element namespace, matching the other surfaces. */
const PLUGIN_ID = 'dsh-ui-interaction'

/** id stamped onto the injected <style> so the loader can find plugin-owned css. */
const STYLE_ID = `${PLUGIN_ID}/branding`

/**
 * Stable viewBox that identifies the FishLogo svg (the whale/fish mark). Built
 * at render time from FISH_LOGO_VIEWBOX, so the attribute value is stable even
 * though the source uses a template literal.
 */
const FISH_VIEWBOX = '0 0 23.16 17.04'

/**
 * Global stylesheet for the branding retouch: hide the whale/fish logo svg by
 * its stable viewBox. The brand text is deliberately left alone.
 */
const GLOBAL_CSS = `
svg[viewBox="${FISH_VIEWBOX}"] {
  display: none;
}
`

/**
 * Mount the branding retouch by injecting its stylesheet.
 * @returns a disposer that removes the stylesheet.
 */
export function applyDshBranding(): () => void {
  const style = document.createElement('style')
  style.dataset.plugin = PLUGIN_ID
  style.dataset.pluginCss = STYLE_ID
  style.textContent = GLOBAL_CSS
  document.head.append(style)
  return () => { style.remove() }
}
