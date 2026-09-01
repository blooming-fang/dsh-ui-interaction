/**
 * Neon-glow ambient background. A fixed, pointer-transparent layer behind the
 * app (#root is lifted onto its own stacking context so the glow never sits
 * over content) carrying several soft colored radial gradients — purple, blue,
 * cyan, magenta — stacked to read as a neon atmosphere. The body
 * `data-ds-dark-theme` flag drives both strength and palette: the dark theme
 * shows the vivid neon, the light theme a barely-there pastel tint so it
 * cannot overexpose the pale surfaces. Each color pool's layout and colors are
 * inline data (the BLOBS array is the single source); the stylesheet only
 * carries the shared rules, the drift keyframes, and the theme switch. The
 * layers are static DOM (no React, no slot): this is pure decorative chrome
 * that owns no data and renders nothing model-visible, so it mounts through
 * the plugin's own effect and disposes with it.
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
.dsh-neon-glow-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform, opacity;
  background: radial-gradient(circle, var(--glow-light) 0%, transparent 70%);
  opacity: 0.16;
}
/* Dark theme: a vivid, deeper-palette neon at higher strength. */
body[data-ds-dark-theme] .dsh-neon-glow-blob {
  background: radial-gradient(circle, var(--glow-dark) 0%, transparent 72%);
  opacity: 0.5;
}
/* Slow drift keeps the atmosphere alive without demanding attention. */
.dsh-neon-glow-blob:nth-child(1) { animation: dsh-neon-drift-a 26s ease-in-out infinite alternate; }
.dsh-neon-glow-blob:nth-child(2) { animation: dsh-neon-drift-b 30s ease-in-out infinite alternate; }
.dsh-neon-glow-blob:nth-child(3) { animation: dsh-neon-drift-c 34s ease-in-out infinite alternate; }
.dsh-neon-glow-blob:nth-child(4) { animation: dsh-neon-drift-d 28s ease-in-out infinite alternate; }
@keyframes dsh-neon-drift-a {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(8vw, 6vh) scale(1.15); }
}
@keyframes dsh-neon-drift-b {
  from { transform: translate(0, 0) scale(1.1); }
  to { transform: translate(-7vw, 8vh) scale(0.95); }
}
@keyframes dsh-neon-drift-c {
  from { transform: translate(0, 0) scale(0.95); }
  to { transform: translate(6vw, -7vh) scale(1.12); }
}
@keyframes dsh-neon-drift-d {
  from { transform: translate(0, 0) scale(1.08); }
  to { transform: translate(-8vw, -5vh) scale(0.98); }
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

/** The four pools spread around the viewport, purple/blue/cyan/magenta. */
const BLOBS: readonly NeonBlob[] = [
  {
    style: { top: '-12%', left: '-10%', width: '46vw', height: '46vw' },
    light: '#a78bfa', dark: '#7c3aed',
  },
  {
    style: { top: '-8%', right: '-12%', width: '42vw', height: '42vw' },
    light: '#38bdf8', dark: '#2563eb',
  },
  {
    style: { bottom: '-16%', left: '-6%', width: '44vw', height: '44vw' },
    light: '#22d3ee', dark: '#0891b2',
  },
  {
    style: { bottom: '-12%', right: '-8%', width: '40vw', height: '40vw' },
    light: '#f472b6', dark: '#db2777',
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
