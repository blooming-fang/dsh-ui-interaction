/**
 * Neon-glow ambient background. A fixed, pointer-transparent layer behind the
 * app (#root is lifted onto its own stacking context so the glow never sits
 * over content) carrying several soft radial gradients in two colors — purple
 * and blue — at mixed sizes laid out as a calm neon atmosphere. The body
 * `data-ds-dark-theme` flag drives both strength and palette: the dark theme
 * shows the neon a little stronger, the light theme a barely-there pastel tint
 * so it cannot overexpose the pale surfaces. Each color pool's layout and
 * colors are inline data (the BLOBS array is the single source); the
 * stylesheet only carries the shared rules, the drift keyframes, and the theme
 * switch. The layers are static DOM (no React, no slot): this is pure
 * decorative chrome that owns no data and renders nothing model-visible, so it
 * mounts through the plugin's own effect and disposes with it.
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
  /* The backdrop itself owns the page background — a light near-white-blue in
     light theme, a deep slate in dark — so the glow draws on top of it,
     clearly visible, rather than hiding behind an opaque app surface. */
  background: #fbfcfe;
}
body[data-ds-dark-theme] .dsh-neon-glow-backdrop {
  background: rgb(21, 21, 23);
}
/* The app shell sits in #root; lift it above the ambient layer. */
.dsh-neon-glow-backdrop ~ #root {
  position: relative;
  z-index: 1;
}
/* The app's base surfaces (AppFrame, conversation root, side panel) paint an
   opaque var(--dsw-alias-bg-base) over the whole viewport, which would bury
   the ambient layer behind it. Make them transparent so the backdrop's
   background + glow show through. The !important beats both the token
   stylesheets and any inline body token the theme presenter applies. */
body {
  --dsw-alias-bg-base: transparent !important;
  --dsw-specific-sidebar-fill: transparent !important;
}
body[data-ds-dark-theme] {
  --dsw-alias-bg-base: transparent !important;
  --dsw-specific-sidebar-fill: transparent !important;
}
.dsh-neon-glow-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform, opacity;
  background: radial-gradient(circle, var(--glow-light) 0%, transparent 70%);
  opacity: 0.2;
}
/* Dark theme: a deeper-palette neon, still kept from turning into a saturated
   wash. */
body[data-ds-dark-theme] .dsh-neon-glow-blob {
  background: radial-gradient(circle, var(--glow-dark) 0%, transparent 72%);
  opacity: 0.42;
}
/* Slow drift keeps the atmosphere alive without demanding attention. The
   three keyframes cycle across the blobs so varied sizes drift on different
   curves. */
.dsh-neon-glow-blob:nth-child(3n+1) { animation: dsh-neon-drift-a 26s ease-in-out infinite alternate; }
.dsh-neon-glow-blob:nth-child(3n+2) { animation: dsh-neon-drift-b 30s ease-in-out infinite alternate; }
.dsh-neon-glow-blob:nth-child(3n) { animation: dsh-neon-drift-c 28s ease-in-out infinite alternate; }
@keyframes dsh-neon-drift-a {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(7vw, 5vh) scale(1.1); }
}
@keyframes dsh-neon-drift-b {
  from { transform: translate(0, 0) scale(1.05); }
  to { transform: translate(-6vw, 6vh) scale(0.96); }
}
@keyframes dsh-neon-drift-c {
  from { transform: translate(0, 0) scale(0.98); }
  to { transform: translate(4vw, -6vh) scale(1.08); }
}
/* The composer input card (data-composer-card) floats over the ambient glow
   with its own elevated shadow; drop it so the surface reads flat against the
   neon backdrop. */
[data-composer-card] {
  box-shadow: none !important;
}
/* The sidebar New Session button (the .newSession control, identified by the
   stable _newSession class suffix rather than its hashed prefix) gets a
   glassmorphism treatment: a translucent frosted fill with a backdrop blur
   that pulls the neon glow through behind it, plus a bright inner highlight
   and a soft floating shadow. Light theme uses a pale milk-glass; dark theme
   a deep smoky glass. */
body:not([data-ds-dark-theme]) [class$="_newSession"] {
  background: rgba(255, 255, 255, 0.42);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border-color: rgba(255, 255, 255, 0.62);
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.55);
}
body:not([data-ds-dark-theme]) [class$="_newSession"]:hover {
  background: rgba(255, 255, 255, 0.62);
}
body[data-ds-dark-theme] [class$="_newSession"] {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border-color: rgba(255, 255, 255, 0.16);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
body[data-ds-dark-theme] [class$="_newSession"]:hover {
  background: rgba(255, 255, 255, 0.16);
}
/* The chat message column (the ChatView .column, identified by the stable
   data-chat-flow attribute rather than its hashed CSS Module class) tightens
   its inter-message gap from 16px to 8px so turns sit closer together. */
[data-chat-flow] {
  gap: 8px;
}
/* User messages: give the user bubble a border one notch darker than the page
   background so it reads as a distinct surface against the neon backdrop.
   :not([data-pending-steering]) keeps the pending steering projection out. */
[data-time-hover-root]:not([data-pending-steering]) [class$="_bubble"] {
  border: 1px solid rgba(15, 23, 42, 0.18);
}
/* Light theme: the code block banner surface of CodeBlock, whose background
   resolves through the --dsl-code-block-banner-background-color custom
   property, drops to a plain neutral white so it reads flat against the neon
   backdrop. The .md-code-block global class is the stable root; overriding the
   custom property there avoids depending on the hashed banner class. */
body:not([data-ds-dark-theme]) .md-code-block {
  --dsl-code-block-banner-background-color: var(--dsw-static-neutral-bluish-00);
}
/* Light theme, chat content area (the message column identified by the stable
   data-chat-flow attribute): any surface whose background resolves through the
   markdown code-block token drops to a neutral white, so code blocks, command
   cards, context injections, tool rows, and JSON blocks all read flat against
   the pale neon backdrop. Overriding the token on the container cascades to
   every descendant without depending on their hashed class names. */
body:not([data-ds-dark-theme]) [data-chat-flow] {
  --dsw-alias-markdown-code-block: var(--dsw-static-neutral-bluish-00);
}
/* Dark theme: the markdown content root (the css.markdown surface of
   MarkdownText) drops its label-primary body color to label-secondary so the
   assistant prose reads one step quieter against the deeper neon backdrop. */
body[data-ds-dark-theme] ._markdown_1r4m5_5 {
  color: var(--dsw-alias-label-secondary);
}
/* Light theme: inline code (the .markdown :not(pre) > code chips, scoped to
   the markdown content root) drops its background to a pure neutral white so
   the chips read flat against the pale neon backdrop instead of tinting. */
body:not([data-ds-dark-theme]) ._markdown_1r4m5_5 :not(pre) > code {
  background-color: var(--dsw-static-neutral-bluish-00);
}
/* Tighten the markdown h2 margins (32px above 16px below becomes 16px above
   16px below) so section headings sit closer to the surrounding prose. */
._markdown_1r4m5_5 h2 {
  margin: 16px 0 16px;
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

/** Five pools in two colors (purple, blue) at mixed sizes, spread around the
    viewport — the light/dark theme colors ride --glow-light/--glow-dark. */
const BLOBS: readonly NeonBlob[] = [
  {
    style: { top: '-18%', left: '-15%', width: '56vw', height: '56vw' },
    light: '#b8adf9', dark: '#8b5cf6',
  },
  {
    style: { top: '-10%', right: '-14%', width: '42vw', height: '42vw' },
    light: '#38bdf8', dark: '#2563eb',
  },
  {
    style: { bottom: '-16%', left: '18%', width: '44vw', height: '44vw' },
    light: '#b8adf9', dark: '#8b5cf6',
  },
  {
    style: { bottom: '-8%', right: '-6%', width: '30vw', height: '30vw' },
    light: '#38bdf8', dark: '#2563eb',
  },
  {
    style: { bottom: '-4%', left: '-8%', width: '24vw', height: '24vw' },
    light: '#b8adf9', dark: '#8b5cf6',
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
