/**
 * Composer frame: give the message input a visible highlight edge.
 *
 * The composer card carries no CSS border at all — its edge is the shared
 * elevation hairline (`--dsw-elevation-soft` draws `0 0 0 .5px` in
 * `--dsw-alias-border-l2`), which is the same warm tone as the card fill
 * (`--dsw-specific-input-major`). On the warm-paper theme that 0.5px line is
 * barely distinguishable, so the field does not read as a field.
 *
 * This layer adds a coral ring around the card and deepens it while the card has
 * focus. An `outline` is used on purpose: it paints over the existing hairline
 * and follows the card's border radius, but takes no space in layout, so the
 * composer cannot change size when the ring appears. The ring colour is mixed
 * with the card fill rather than a fixed hex, so it stays in palette in the
 * light and the dark theme alike.
 *
 * Pure presentation: no data, no slots, no commands, nothing model-visible.
 */

/** The plugin's own element namespace, matching the other surfaces. */
const PLUGIN_ID = 'dsh-ui-interaction'

/** id stamped onto the injected <style> so the loader can find plugin-owned css. */
const STYLE_ID = PLUGIN_ID + '/composer-frame'

/**
 * The composer card. ui-conversation stamps the stable `data-composer-card`
 * attribute on the element, so no hashed class name is involved.
 */
const CARD = '[data-composer-card]'

export const COMPOSER_FRAME_CSS = [
  CARD + ' {',
  /* A single hairline, deliberately not a heavier frame. The colour carries the
     weight instead: the coral accent thinned with the card's own fill, so the
     edge reads as a warm tint rather than a second brand block. Whole pixel
     widths only - Chromium rounds fractional outline widths on some zoom
     levels, and 1.5px collapses to something lighter than this 1px. */
  '  outline: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 65%, var(--dsw-specific-input-major));',
  '  outline-offset: -1px;',
  '  transition: outline-color .15s var(--ds-ease-in-out, ease-in-out);',
  '}',
  /* While the user is typing, the ring goes to the accent itself. */
  CARD + ':focus-within {',
  '  outline-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 90%, var(--dsw-specific-input-major));',
  '}',
  '',
].join('\n')

/**
 * Mount the composer frame ring.
 * @returns a disposer that removes the style tag.
 */
export function applyComposerFrame(): () => void {
  if (document.querySelector('style[data-plugin-css=' + JSON.stringify(STYLE_ID) + ']') !== null) return () => {}
  const style = document.createElement('style')
  style.dataset.plugin = PLUGIN_ID
  style.dataset.pluginCss = STYLE_ID
  style.textContent = COMPOSER_FRAME_CSS
  document.head.append(style)
  return () => { style.remove() }
}
