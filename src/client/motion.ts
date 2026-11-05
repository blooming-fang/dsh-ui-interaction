/**
 * Motion layer: the missing base transition for the whole interface.
 *
 * The platform ships a motion scale in `ui-theme` — `--ds-transition-duration-fast`
 * (0.1s), `--ds-transition-duration` (0.2s), `--ds-transition-duration-slow`
 * (0.3s) and `--ds-ease-in-out` — but almost nothing consumes it: of the ~743
 * rules in the product that change a colour on `:hover` / `:focus-visible` /
 * `[aria-expanded]`, only 11.7% declare a transition, and the primitives layer
 * (`Button`, `Input`, `Menu`, `Pill`, `Tag`, `Tooltip`, `Checkbox`) declares none
 * at all. Hover and focus therefore swap colour in a single frame, which reads as
 * stiff.
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
 * The base is deliberately universal (`html`, `body` and every descendant)
 * rather than a list of class fragments. The product's CSS-module names are
 * hashed per build and camel-cased (`_sessionRow`, `_panelRow`, `_cardMain`), so a
 * fragment list silently misses whole families — `[class*="_row"]` never matches
 * `_sessionRow` — and the escape hatch would be to enumerate hundreds of names
 * that rot on the next release. Since only colour properties are transitioned,
 * applying them everywhere is safe: an element that does not repaint pays
 * nothing, and an element that animates opacity or background through a
 * keyframe or its own transition still wins on specificity.
 *
 * The one place the base is deliberately muted is a theme swap: switching
 * light/dark rewrites every token on `body`, so a colour transition on every
 * element would turn the switch into a full-page cross-fade. That is not the
 * intent of this layer (it is there for hover/focus, not for a scheme change),
 * so the guard below turns transitions off for exactly the frames in which the
 * new palette is committed: ui-theme emits `theme/change`, the attribute goes
 * on before the browser recalculates style, and it comes off two frames later,
 * once the new colours are already painted.
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
 * The sidebar New Session button reveals its shortcut chip by flipping
 * `opacity` 0 -> 1 on hover with no transition, so the chip pops into place.
 * The chip is the only element in that row whose state change is not a paint,
 * and ui-sidebar declares no transition for it.
 */
const SHORTCUT = '[class*="_newSessionShortcut"]'

/**
 * Attribute stamped on `html` while a new palette is being committed. It has
 * to out-specify the base rule, which is why this one selector is not wrapped
 * in `:where()`: 0,1,1 beats the base's 0,0,0, and it also beats a component's
 * own class-level transition so a theme swap cannot start one anywhere.
 */
const SETTLE_ATTR = 'data-dshui-motion-off'

export const MOTION_CSS = [
  '@media (prefers-reduced-motion: no-preference) {',
  '  /* Base: colour, elevation and opacity fade; geometry untouched. */',
  '  :where(html, body, body *) {',
  BASE_TRANSITION,
  '  }',
  '',
  '  /* The New Session shortcut chip: fade in instead of pop. */',
  '  :where(' + SHORTCUT + ') {',
  '    transition: opacity var(--ds-transition-duration-fast, 100ms) ease-out;',
  '  }',
  '}',
  '',
  '/* A palette swap is a re-colour, not an interaction: hold every transition',
  '   off for the frames in which the new tokens are committed. */',
  'html[' + SETTLE_ATTR + '],',
  'html[' + SETTLE_ATTR + '] * {',
  '  transition: none;',
  '}',
  '',
].join('\n')

/** The only shape this module needs from the client context. */
export interface ThemeChangeHost {
  on?: unknown
}

/**
 * Mount the motion layer, and hold transitions off across palette swaps.
 * @param host - the client context; only its `on` is used (for `theme/change`).
 * @returns a disposer that removes the style tag and the theme listener.
 */
export function applyMotion(host?: ThemeChangeHost): () => void {
  if (document.querySelector('style[data-plugin-css=' + JSON.stringify(STYLE_ID) + ']') !== null) return () => {}
  const style = document.createElement('style')
  style.dataset.plugin = PLUGIN_ID
  style.dataset.pluginCss = STYLE_ID
  style.textContent = MOTION_CSS
  document.head.append(style)

  const root = document.documentElement
  let frame = 0
  /* Called as a method on the host, never unbound: ctx.on resolves through the
     service proxy and needs its receiver. */
  const bind = host as { on?: (event: string, listener: () => void) => unknown } | undefined
  const listener = (): void => {
    /* Set synchronously: the browser recalculates style after the current task,
       so the attribute is already there when the new palette is committed. */
    root.setAttribute(SETTLE_ATTR, '')
    if (frame !== 0) return
    /* Two frames: the first lets the recalculated colours paint, the second is
       the earliest point at which lifting the attribute cannot start a
       transition of its own. */
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        frame = 0
        root.removeAttribute(SETTLE_ATTR)
      })
    })
  }
  const stop = typeof bind?.on === 'function' ? bind.on('theme/change', listener) : undefined

  return () => {
    style.remove()
    if (frame !== 0) cancelAnimationFrame(frame)
    root.removeAttribute(SETTLE_ATTR)
    if (typeof stop === 'function') (stop as () => void)()
  }
}
