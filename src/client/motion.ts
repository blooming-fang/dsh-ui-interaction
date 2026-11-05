/**
 * Motion layer: the missing base transition for the whole interface.
 *
 * The platform ships a motion scale in `ui-theme` — `--ds-transition-duration-fast`
 * (0.1s), `--ds-transition-duration` (0.2s), `--ds-transition-duration-slow`
 * (0.3s) and `--ds-ease-in-out` — but almost nothing consumes it: of the ~743
 * rules in the product that change a colour on `:hover` / `:focus-visible` /
 * `[aria-expanded]`, only 11.7% declare a transition, and the primitives layer
 * (`Button`, `Input`, `Menu`, `Pill`, `Tag`, ...) declares none at all. Hover and
 * focus therefore swap colour in a single frame, which reads as stiff.
 *
 * This layer adds that base as one stylesheet: colour-ish properties only, never
 * geometry. Height, width, margin and `transform` are deliberately absent, so no
 * rule here can re-flow a layout or fight a component that animates its own box
 * (the sidebar rail, the switch thumb, the menu surfaces all keep their own
 * motion). Every selector sits inside `:where()`, which drops its specificity to
 * zero: any component that already declares a transition — or switches
 * transitions off while the user drags the sidebar — still wins, so this layer
 * only ever adds motion where there was none.
 *
 * Pure presentation: no data, no slots, no commands, nothing model-visible.
 */

/** The plugin's own element namespace, matching the other surfaces. */
const PLUGIN_ID = 'dsh-ui-interaction'

/** id stamped onto the injected <style> so the loader can find plugin-owned css. */
const STYLE_ID = PLUGIN_ID + '/motion'

/**
 * The shared timing. Hover/focus colour work rides ui-theme's fast step with
 * `ease-out` (leaves the cursor's frame immediately, settles); elevation rides
 * the standard step on the platform's own in-out curve.
 */
const BASE_TRANSITION = [
  '    transition:',
  '      background-color var(--ds-transition-duration-fast, 100ms) ease-out,',
  '      color var(--ds-transition-duration-fast, 100ms) ease-out,',
  '      border-color var(--ds-transition-duration-fast, 100ms) ease-out,',
  '      outline-color var(--ds-transition-duration-fast, 100ms) ease-out,',
  '      box-shadow var(--ds-transition-duration, 200ms) var(--ds-ease-in-out, cubic-bezier(.4, 0, .2, 1)),',
  '      opacity var(--ds-transition-duration-fast, 100ms) ease-out;',
].join('\n')

/**
 * What gets the base. Two halves: interactive by semantics (element name and
 * ARIA role, so hashed class prefixes never enter the picture), plus the row /
 * card / chip families by local-name fragment for the surfaces that are plain
 * divs with a hover paint (sidebar rows, workspace rows, plugin cards, tabs).
 */
const INTERACTIVE = [
  'button',
  '[role="button"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="treeitem"]',
  '[role="switch"]',
  'a[href]',
  'summary',
  'input',
  'textarea',
  'select',
  '[class*="_row"]',
  '[class*="_card"]',
  '[class*="_item"]',
  '[class*="_chip"]',
  '[class*="_pill"]',
  '[class*="_toggle"]',
  '[class*="_trigger"]',
  '[class*="_action"]',
  '[class*="_file"]',
  '[class*="_crumb"]',
  '[class*="_close"]',
  '[class*="_tab"]',
].join(',\n    ')

/**
 * The sidebar New Session button reveals its shortcut chip by flipping
 * `opacity` 0 -> 1 on hover with no transition, so the chip pops into place.
 * The chip is the only element in that row whose state change is not a paint,
 * and ui-sidebar declares no transition for it.
 */
const SHORTCUT = '[class*="_newSessionShortcut"]'

export const MOTION_CSS = [
  '@media (prefers-reduced-motion: no-preference) {',
  '  /* Base: colour, elevation and opacity fade; geometry untouched. */',
  '  :where(',
  '    ' + INTERACTIVE,
  '  ) {',
  BASE_TRANSITION,
  '  }',
  '',
  '  /* The New Session shortcut chip: fade in instead of pop. */',
  '  :where(' + SHORTCUT + ') {',
  '    transition: opacity var(--ds-transition-duration-fast, 100ms) ease-out;',
  '  }',
  '}',
  '',
].join('\n')

/**
 * Mount the motion layer.
 * @returns a disposer that removes the style tag.
 */
export function applyMotion(): () => void {
  if (document.querySelector('style[data-plugin-css=' + JSON.stringify(STYLE_ID) + ']') !== null) return () => {}
  const style = document.createElement('style')
  style.dataset.plugin = PLUGIN_ID
  style.dataset.pluginCss = STYLE_ID
  style.textContent = MOTION_CSS
  document.head.append(style)
  return () => { style.remove() }
}
