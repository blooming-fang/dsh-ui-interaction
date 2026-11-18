/**
 * `model` namespace dictionaries (the model surfaces) and
 * `settings.interaction` dictionaries (the bundle's switch card on the
 * Plugins page).
 *
 * `trigger.selectAria` reads identically to `trigger.fallback` today and is
 * still a separate key: the visible fallback label and the accessible name of
 * an unset trigger are free to diverge per locale, and folding it into
 * `trigger.aria` would announce the degenerate "Select model, current Select
 * model".
 *
 * `option.deepseekV4Flash.description` / `option.deepseekV4Pro.description`
 * translate the two built-in provider descriptions the Host advertises in
 * English; the menu shows the localized copy only while the advertised text is
 * still the built-in one (see `descriptionOf` in index.ts).
 */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'command.description': '选择本会话使用的模型',
  'option.loadError': '目录加载失败：{message}',
  'option.deepseekV4Flash.description': '快速、高效且经济；适合目标明确、常规或并行任务。',
  'option.deepseekV4Pro.description': '更强的自主编码、知识与复杂推理能力；适合复杂或质量优先的任务，但成本更高。',
  'trigger.fallback': '选择模型',
  'trigger.loading': '正在加载模型…',
  'trigger.selectAria': '选择模型',
  'trigger.aria': '选择模型，当前 {model}',
  'trigger.ariaEffort': '选择模型，当前 {model}，推理等级 {effort}',
  'menu.aria': '模型与推理等级',
  'menu.model': '模型',
  'menu.effort': '推理等级',
  'effort.providerDefault': 'Default',
  'status.loading': '正在刷新模型列表…',
  'error.action': '模型操作失败：{message}',
  'action.reload': '重新加载',
  'warning.groupLoad': '{name} 加载失败：{message}',
  'empty.models': '没有可用的模型。',
  'empty.providers': '没有可用的提供商。',
  'blocked.composer': '当前模型不可用，请先选择模型',
  'empty.efforts': '当前模型未提供推理等级。',
} satisfies Record<string, string>

/** The model namespace key union. */
export type ModelKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'command.description': 'Select the model for this conversation',
  'option.loadError': 'Catalog failed to load: {message}',
  'option.deepseekV4Flash.description': 'Fast, efficient, and economical; suited to focused, routine, or parallel tasks.',
  'option.deepseekV4Pro.description': 'Stronger agentic coding, knowledge, and difficult reasoning; suited to complex or quality-critical tasks at higher cost.',
  'trigger.fallback': 'Select model',
  'trigger.loading': 'Loading models…',
  'trigger.selectAria': 'Select model',
  'trigger.aria': 'Select model, current {model}',
  'trigger.ariaEffort': 'Select model, current {model}, reasoning effort {effort}',
  'menu.aria': 'Model and reasoning effort',
  'menu.model': 'Model',
  'menu.effort': 'Effort',
  'effort.providerDefault': 'Default',
  'status.loading': 'Refreshing model list…',
  'error.action': 'Model operation failed: {message}',
  'action.reload': 'Reload',
  'warning.groupLoad': '{name} failed to load: {message}',
  'empty.models': 'No models available.',
  'empty.providers': 'No providers available.',
  'blocked.composer': 'This model is unavailable — select one to continue',
  'empty.efforts': 'This model provides no reasoning effort levels.',
} satisfies Record<ModelKey, string>

/** Dictionary namespace owning the bundle's switch card copy. */
export const SWITCHES_LOCALE_NS = 'settings.interaction'

/** Simplified Chinese switch-card dictionary (the key-set source of truth). */
export const switchesZh = {
  'title': '交互优化开关',
  'description': '两组建模互不影响：关掉一组立刻撤下该组功能，关掉再打开即原样恢复，不需要重启或重装。',
  'interaction.label': '交互与结构',
  'interaction.hint': '两级「提供商 → 模型」选择器（含原生模型菜单选项槽）、侧栏两列面板网格、珊瑚色「新会话」主按钮、全站过渡动效、去掉 logo 的品牌改版。',
  'appearance.label': '外观主题',
  'appearance.hint': '暖纸质配色令牌、字体与圆角刻度，以及 composer 输入框的珊瑚色高亮描边。',
} satisfies Record<string, string>

/** The switch-card namespace key union. */
export type SwitchesKey = keyof typeof switchesZh

/** English switch-card dictionary, checked complete against the zh key set. */
export const switchesEn = {
  'title': 'Interaction switches',
  'description': 'The two groups are independent: switching one off removes that group immediately, and switching it back on restores it — no restart, no reinstall.',
  'interaction.label': 'Interaction and structure',
  'interaction.hint': 'The two-level provider → model picker (with its native model-menu options slot), the two-column sidebar panel grid, the coral New Session button, the site-wide motion layer, and the logo-free brand retouch.',
  'appearance.label': 'Appearance theme',
  'appearance.hint': 'The warm-paper token palette, its type and radius scale, and the composer input\'s coral highlight ring.',
} satisfies Record<SwitchesKey, string>
