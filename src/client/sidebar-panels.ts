/**
 * Two-column sidebar panel grid. The sidebar's global panel list (the
 * `sidebar.panellist` rows: 插件 / Superagent / 自动化任务 / 我的工作台 / 更多 …)
 * ships as a single vertical column of full-width 36px rows, which eats the
 * height the workspace/session list needs. This layer turns that one list into
 * a two-column grid of half-width rows, so five panels cost three rows instead
 * of five and every pixel below goes back to `sidebar.workspaces`.
 *
 * Why CSS only: the rows are ordinary `<button>`s rendered by ui-sidebar's own
 * `SidebarRoot`, and the list is a single `<nav>`. Re-laying it out needs no
 * data, no slot and no command — a stylesheet over the stable class fragments
 * (`_panelList`, `_panelRow`, `_panelTitle`) is the whole change, so React
 * re-renders cannot undo it.
 *
 * Scope: the collapsed rail keeps its single icon column. ui-sidebar adds its
 * `…_collapsed` local class to the root element exactly while the rail is
 * shown, and the rail's rows are fixed 36x36 icon buttons — so every rule here
 * is scoped to the panel list minus that rail, which can only be true in the
 * expanded column.
 *
 * Pure presentation: no data, no slots, no commands, nothing model-visible.
 */

/** The plugin's own element namespace, matching the other surfaces. */
const PLUGIN_ID = 'dsh-ui-interaction'

/** id stamped onto the injected <style> so the loader can find plugin-owned css. */
const STYLE_ID = PLUGIN_ID + '/sidebar-panels'

/**
 * Selector prefix shared by every rule: the panel list, minus the rail.
 *
 * The class is matched by its stable local **fragment** with `*=`, never with
 * `$=`: React appends its state classes after the local one
 * (`…_panelRow …_panelActive`, `…_panelTitle …_wide`), so a suffix match drops
 * precisely the rows that changed state. That bug is why the active row used
 * to fall back to ui-sidebar's own 36px metrics and made the whole grid jump a
 * few pixels on every click — the row that was selected was the one row this
 * stylesheet no longer reached.
 */
const LIST = '[class*="_panelList"]:not([class*="_collapsed"] *)'

/**
 * The grid. Two equal columns, a 2px row gap to keep the pair rhythm of the
 * original stack, and a slightly wider column gap so the two cells read as
 * separate targets. Children are wrapped by the primitives' Tooltip, so each
 * direct child becomes a stretching flex box and the row button fills it.
 */
export const SIDEBAR_PANEL_CSS = [
  LIST + ' {',
  '  display: grid;',
  /* auto-fit over a 104px minimum: exactly two columns at the default sidebar
     width, and a graceful drop back to a single column if the user drags the
     column very narrow (the row labels ellipsize before that, never overflow). */
  '  grid-template-columns: repeat(auto-fit, minmax(104px, 1fr));',
  /* Tracks are pinned, so no cell's content can ever move its own row. */
  '  grid-auto-rows: 32px;',
  '  gap: 2px 4px;',
  '}',
  LIST + ' > * {',
  '  display: flex;',
  '  min-width: 0;',
  '}',
  /* Half-width rows, with the box pinned: the active row's own state class
     brings ui-sidebar's 36px metrics (7px padding, 22px line-height) and would
     otherwise resize the track on click. Height, vertical padding and line
     height are therefore fixed here rather than left to min-height. */
  LIST + ' [class*="_panelRow"] {',
  '  box-sizing: border-box;',
  '  flex: 1 1 auto;',
  '  width: 100%;',
  '  min-width: 0;',
  '  height: 32px;',
  '  min-height: 32px;',
  '  margin: 0;',
  '  padding: 0 8px;',
  '  gap: 6px;',
  '  line-height: 20px;',
  '}',
  /* Labels step down one size so the longest one (我的工作台 / 自动化任务) fits
     the half-width column without ellipsis. */
  LIST + ' [class*="_panelTitle"] {',
  '  font-size: 13px;',
  '  line-height: 20px;',
  '}',
  /* Five panels leave the last row half empty; let the trailing row (the More
     launcher) take the whole width instead of leaving a hole. */
  LIST + ' > *:last-child:nth-child(odd) {',
  '  grid-column: 1 / -1;',
  '}',
  '',
].join('\n')

/**
 * Mount the two-column panel grid.
 * @returns a disposer that removes the style tag.
 */
export function applySidebarPanelGrid(): () => void {
  if (document.querySelector('style[data-plugin-css=' + JSON.stringify(STYLE_ID) + ']') !== null) return () => {}
  const style = document.createElement('style')
  style.dataset.plugin = PLUGIN_ID
  style.dataset.pluginCss = STYLE_ID
  style.textContent = SIDEBAR_PANEL_CSS
  document.head.append(style)
  return () => { style.remove() }
}
