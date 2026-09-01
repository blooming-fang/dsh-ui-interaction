/**
 * Neon-glow ambient background. A fixed, pointer-transparent layer behind the
 * app (#root is lifted onto its own stacking context so the glow never sits
 * over content) carrying two soft colored radial gradients — purple and blue —
 * stacked as a calm neon atmosphere. The body `data-ds-dark-theme` flag drives
 * both strength and palette: the dark theme shows the neon a little stronger,
 * the light theme a barely-there pastel tint so it cannot overexpose the pale
 * surfaces. Each color pool's layout and colors are inline data (the BLOBS
 * array is the single source); the stylesheet only carries the shared rules,
 * the drift keyframes, and the theme switch. The layers are static DOM (no
 * React, no slot): this is pure decorative chrome that owns no data and
 * renders nothing model-visible, so it mounts through the plugin's own effect
 * and disposes with it.
 */
/** The plugin's own element namespace, matching the other surfaces. */
const PLUGIN_ID = 'dsh-ui-interaction'

/** id stamped onto the injected <style> so the loader can find plugin-owned css. */
const STYLE_ID = `${PLUGIN_ID}/neon-glow`

/** id of the fixed backdrop layer. */
const GLOW_ID = `${PLUGIN_ID}-neon-glow`

/**
 * Global stylesheet for the neon-glow layer. `.dsh-neon-glow-backdrop` is the
 * fixed full-viewport layer; each `.dsh-neon-glow-blob` is one blurred color
 * pool whose layout and light/dark colors are set inline from the BLOBS data.
 * Theme and strength are keyed off the body dark-theme flag, so a theme flip
 * re-palettes the glow without JS.
 */
const GLOBAL_CSS = `
.dsh-neon-glow-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
/* The app shell sits in #root; lift it above the ambient layer. */
.dsh-neon-glow-backdrop ~ #root {
  position: relative;
  z-index: 1;
}
/* The app's base surfaces (AppFrame, conversation root, side panel) paint an
   opaque var(--dsw-alias-bg-base) over the whole viewport, which would bury
   the ambient layer behind it. Let the glow show through as a subtle tint by
   making those base fills translucent — dark keeps ~72% of its base so the
   neon reads faintly, light keeps ~95% so it stays a whisper. */
body {
  --dsh-neon-bg-alpha: 0.95;
  --dsh-neon-sidebar-alpha: 0.95;
}
body[data-ds-dark-theme] {
  --dsh-neon-bg-alpha: 0.72;
  --dsh-neon-sidebar-alpha: 0.82;
}
body {
  --dsw-alias-bg-base: color-mix(in srgb, var(--dsw-static-neutral-bluish-00) var(--dsh-neon-bg-alpha), transparent);
  --dsw-specific-sidebar-fill: color-mix(in srgb, var(--dsw-static-neutral-bluish-50) var(--dsh-neon-sidebar-alpha), transparent);
}
body[data-ds-dark-theme] {
  --dsw-alias-bg-base: color-mix(in srgb, var(--dsw-static-neutral-bluish-950) var(--dsh-neon-bg-alpha), transparent);
  --dsw-specific-sidebar-fill: color-mix(in srgb, var(--dsw-static-neutral-bluish-900) var(--dsh-neon-sidebar-alpha), transparent);
}
.dsh-neon-glow-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform, opacity;
  background: radial-gradient(circle, var(--glow-light) 0%, transparent 70%);
  opacity: 0.1;
}
/* Dark theme: a deeper-palette neon, still kept light so it reads as a calm
   atmosphere rather than a saturated wash. */
body[data-ds-dark-theme] .dsh-neon-glow-blob {
  background: radial-gradient(circle, var(--glow-dark) 0%, transparent 72%);
  opacity: 0.32;
}
/* Slow drift keeps the atmosphere alive without demanding attention. */
.dsh-neon-glow-blob:nth-child(1) { animation: dsh-neon-drift-a 26s ease-in-out infinite alternate; }
.dsh-neon-glow-blob:nth-child(2) { animation: dsh-neon-drift-b 30s ease-in-out infinite alternate; }
@keyframes dsh-neon-drift-a {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(6vw, 5vh) scale(1.1); }
}
@keyframes dsh-neon-drift-b {
  from { transform: translate(0, 0) scale(1.05); }
  to { transform: translate(-6vw, -5vh) scale(0.96); }
}
/* Honor reduced-motion: keep the ambient color but drop the drift. */
@media (prefers-reduced-motion: reduce) {
  .dsh-neon-glow-blob {
    animation: none !important;
  }
}
`

/** One color pool: its layout and the light/dark theme colors (--glow-light/--glow-dark). */
interface NeonBlob {
  style: Partial<Record<string, string>>
  light: string
  dark: string
}

/** Two pools spread on the diagonal — purple and blue — in the light/dark theme colors (--glow-light/--glow-dark). */
const BLOBS: readonly NeonBlob[] = [
  {
    style: { top: '-14%', left: '-12%', width: '52vw', height: '52vw' },
    light: '#a78bfa', dark: '#7c3aed',
  },
  {
    style: { bottom: '-16%', right: '-10%', width: '48vw', height: '48vw' },
    light: '#38bdf8', dark: '#2563eb',
  },
]

/**
 * Mount the neon-glow ambient background into the document body.
 * @returns a disposer that tears the layer and its stylesheet down.
 */
export function applyNeonGlow(): () => void {
  const style = document.createElement('style')
  style.dataset.plugin = PLUGIN_ID
  style.dataset.pluginCss = STYLE_ID
  style.textContent = GLOBAL_CSS

  const glow = document.createElement('div')
  glow.id = GLOW_ID
  glow.className = 'dsh-neon-glow-backdrop'
  glow.setAttribute('aria-hidden', 'true')
  for (const blob of BLOBS) {
    const el = document.createElement('div')
    el.className = 'dsh-neon-glow-blob'
    for (const [key, value] of Object.entries(blob.style)) {
      if (value === undefined) continue
      el.style.setProperty(key, value)
    }
    el.style.setProperty('--glow-light', blob.light)
    el.style.setProperty('--glow-dark', blob.dark)
    glow.append(el)
  }

  document.head.append(style)
  document.body.prepend(glow)

  return () => {
    glow.remove()
    style.remove()
  }
}
