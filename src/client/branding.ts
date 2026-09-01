/**
 * Branding retouch for the neon-chrome profile: drop the DeepSeek whale/fish
 * logo marks. Pure CSS so it survives React reconciliation — the svgs are
 * hidden, not deleted, because deleting them lets React re-create them.
 *
 * Targets ride stable DOM signatures, never the full hashed class prefix:
 *  - the BrandWordmark svg (`viewBox="0 0 182 24"`) is hidden;
 *  - the FishLogo svg (`viewBox="0 0 23.16 17.04"` — collapsed-sidebar rail
 *    and New Session hero headline) is hidden.
 *
 * No data, no slots, nothing model-visible.
 */

/** The plugin's own element namespace, matching the other surfaces. */
const PLUGIN_ID = 'dsh-ui-interaction'

/** id stamped onto the injected <style> so the loader can find plugin-owned css. */
const STYLE_ID = `${PLUGIN_ID}/branding`

/** Stable viewBox that identifies the BrandWordmark svg. */
const WORDMARK_VIEWBOX = '0 0 182 24'

/** Stable viewBox that identifies the FishLogo svg. */
const FISH_VIEWBOX = '0 0 23.16 17.04'

/**
 * Global stylesheet for the branding retouch: hide the whale and fish logo
 * svgs by their stable viewBox.
 */
const GLOBAL_CSS = `
svg[viewBox="${WORDMARK_VIEWBOX}"] {
  display: none;
}
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
