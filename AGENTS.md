# AGENTS.md

本文件用于管理 `plugins/dsh-ui-interaction/` 内的开发工作。`dsh-ui-interaction` 是一个**自包含的 profile 组合包**，目标是持续优化与改变 DeepSeek Harness Web（dsh web）的交互界面。外层 deepseek-harness 仓库根目录的 `AGENTS.md` 约定仍然适用；本文件补充本包特有的契约与不可回退的不变量。

## 项目定位

**这是一个 dsh web 交互界面的优化集合包**，而不是单个小补丁。它会以「一个 patch 层 + 一个浏览器端插件」的整体形态，逐步叠加多个交互优化。所有优化共享同一套基础结构（`dsh.bundle.patch` 补丁层 + `dsh.client` 浏览器端 + 自包含源码 + 构建/打包流水线），并通过 `cordis.patch.yml` 覆盖/替换内置表面。

**当前已实现的功能**：
1. **模型选择器优化** —— 把 composer 的模型选择从「单一按提供商分组的大列表」改成「先提供商、后模型」的两级下钻。
2. **暖纸质外观主题** —— 把一整套设计令牌（珊瑚橙主色 `#cc785c` + 暖米白画布 `#f5f0e4` + 同族暖炭黑暗色面）通过 ui-theme 的 `ctx.theme.overrideTokens` 压进别名令牌层，配套 StyreneB / Inter / JetBrains Mono 字体栈与更克制的圆角刻度；亮/暗两套值成对给出，一处注册覆盖两种配色。
3. **侧边栏面板两列网格** —— 把左侧栏顶部的全局面板行（插件 / Superagent / 自动化任务 / 我的工作台 / 更多）从单列改成两列网格，5 个面板从 5 行压到 3 行，省下的高度全给下面的工作区列表。
4. **侧栏「新会话」主按钮** —— 把新会话按钮从「中性底 + 发丝线」改成与 composer 发送按钮同一套珊瑚橙色值（`button-info-fill` / `button-info-hover` + 白字）。
5. **输入框高亮描边** —— composer 的边界原本只是和卡片底色同调的 0.5px 发丝线（`--dsw-elevation-soft`），在暖米色主题上几乎看不见；加一圈珊瑚色 `outline` 环，输入时加深。
6. **品牌改版** —— 去掉 DeepSeek 的鲸鱼/鱼形 logo，**品牌文字保持不变**：隐藏 `FishLogo`（侧栏品牌 mark slot 的折叠态工具栏与展开态头部、新会话英雄区的动态鱼形头图），保留侧栏 `sidebar.brand.name` 的无 logo wordmark 文字。

**后续规划**：在本包内继续增加其它交互优化。每个新优化应遵循下文「新增一个优化功能」的流程，并与现有功能在同一 patch 层内共处。

## 当前功能：两级模型选择（provider → model）

`dsh-ui-interaction` 的浏览器端是内置 `@deepseek-ai/dsh-client-ui-model-selection` 表面（composer 的 `conversation.input.model` 席位 + `/model` popupSelect 命令，建立在共享的按会话模型目录之上）的自包含移植，唯一的行为变化是：composer 席位的 Model 下钻现在是**先提供商、再选该提供商的模型**，而不是一个按提供商分组的大列表。

- 它接入与内置版本相同的缝隙：`modelDirectories` 服务（`ModelDirectoryResolver`）、`/model` 命令贡献、`conversation.input.model` slot。
- **数据源（dsh 0.1.7 契约）**：目录不再来自已移除的 `session.models` RPC，而由两者合成 —— 「Host 代次共享目录 `ctx.remote.session.modelCatalog()`」（`catalog.ts` 的 `ModelCatalogDirectory`，一次读取服务全部会话，带 generation 失效）+「本会话持久化的 `modelSelection` projection」（`sessions.binding(id).session.projections.faceOf('modelSelection')`）；提交仍走 `remote.session.selectModel`。两个入口读同一份合成结果。`ctx.remote.session` 由 `@deepseek-ai/dsh-api-session-controller/remote` 声明（见下文类型面陷阱）。
- **菜单是 portal**：下拉渲染到 `document.body`（`.menu` 为 `position: fixed`，先以 `visibility: hidden` 在原点量一次真实尺寸，再夹取到视口内）。原因是 composer 轨道会滚动/裁剪绝对定位弹层。触发器留在席位自己的布局里，窄容器（`@container (width <= 360px)`）下标签收起、只留前导图标。键盘（Esc / ↑↓）与失焦关闭同时挂在触发器与 portal 菜单上。
- 本包的 `cordis.patch.yml` **禁用**内置的 `ui-model-selection` 行并**插入**本包自己的行。安装后它完全替换内置表面；不会同时启用内置包（两者会在同一 slot 上冲突）。
- **不要**依赖 workspace 包：`D:\plugin\deepseek-harness\packages\client\ui-model-selection` 是 0.1.0-rc.5 的开发副本；对照物是**已安装闭包里的同名包**及其 `lib/types/**/*.d.ts`。

## 当前功能：暖纸质外观主题（theme.ts）

`dsh-ui-interaction` 在浏览器端挂一层**外观主题**（`theme.ts`）：把一整套设计令牌（珊瑚橙主色 + 暖米白画布 + 同族暖炭黑暗色面）折进 ui-theme 的别名令牌层，全站换肤而不改任何组件。

- **接入缝隙** —— ui-theme（`@deepseek-ai/dsh-client-ui-theme`）是 `--dsw-*` 令牌样式表与配色的唯一权威，并向第三方开放 `ctx.theme`：`overrideTokens(source, { light, dark })` 把一个令牌图层压在当前主题之上（同一 source 再次调用即整层替换）。本包在 `apply` 里 `ctx.inject(['theme'], …)` 取得该服务，用 `overrideTokens('dsh-ui-interaction', THEME_TOKENS)` 注册，随 effect 卸载撤下。**亮/暗两值成对给出**，所以一层即覆盖两种配色，且不夺走用户的光照偏好（light / dark / system 仍由 Settings 决定）。
- **两个半边** —— `applyThemeTokens(theme)` 注册颜色层；`applyThemeStyle()` 注入插件自带样式表，承载令牌层表达不了的部分（`:root` 级默认字体栈、圆角刻度、markdown 标题衬线）。二者都在 `apply` 的 `ctx.effect` 中挂载。
- **令牌落到哪** —— 由 ui-theme 自己的 presenter 写进 `body` 的内联自定义属性（`body.style.setProperty`），本模块只提供字面值，不自己拼 DOM 或写全局 CSS 颜色。
- **调色板（单一数据源 `THEME_TOKENS`）** —— 亮色：画布 `#f5f0e4`、抬升面 `#efe9db` / `#e9e1d1` / `#e1d7c4`、文字阶梯 `#141413` → `#3d3d3a` → `#6c6a64` → `#857f74`、发丝线 `#dfd5c5` / `#e6ddcd`、主色 `#cc785c`（按下 `#a9583e`、禁用 `#e3dacb`）；暗色：画布 `#1e1c18`、抬升面 `#26231e` / `#2c2924` / `#35312a`、文字 `#efebe4` / `#a8a49c` / `#918d84`，主色仍为珊瑚橙（暖炭黑上 5.5:1），需要「贴在暗画布上的强调色」时用浅珊瑚 `#e0997c`。
- **降眩光（按用户反馈调过一版）** —— 设计系统的原色 `#faf9f5` 画布（相对亮度 0.947）铺满整屏聊天区时偏白偏刺眼，因此整条阶梯统一下压约 7% 亮度并保持同一暖色相：亮色画布 0.947 → **0.873**（`#f5f0e4`），抬升面随之下压，正文对比度反而升高（body 10.34:1 → 9.58:1 仍远高于 AA，墨色 17.5:1 → 16.2:1）；暗色则反向处理：画布从 `#181715`（0.008）抬到 `#1e1c18`（0.010）减轻「黑洞感」，最亮文字从 `#faf9f5` 降到 `#efebe4`（15.2:1 → 14.7:1），大块浅字不再那么扎眼。**任何后续调色都应保持这两条：亮色大面积背景 L ≤ 0.88，暗色正文亮度不高于 `#efebe4` 档。**
- **覆盖到的令牌组** —— 页面/抬升面与遮罩、发丝线 1–4、文字阶梯（primary / secondary / tertiary / caption / dimmed / foreground / inverted / shimmer）、品牌与按钮（primary / contrast / elevated / floating / ghost / tool-bar，其中 `button-info-fill` 就是发送按钮）、交互水洗、语义状态（business / error / success / warn / idle）、链接、markdown 与代码（code-block / banner / inline-code / tag / citation / segment）、diff 底色、feature 面（`specific-sidebar-fill`、`specific-bubble`、`specific-input-major`、selector / tip / `menu-surface-fill` / `menu-group-header-fill` / settings-card，落在 surface-card 上）、滚动条、switch 拇指、toast / tooltip、onboarding、四个阴影令牌，以及两处 thinking 渐变。
- **排版** —— 设计系统是「编辑体衬线标题 + humanist sans 正文」的拆分，在 `html:root` 上落三套栈：`--dsh-font-family-text-default` = StyreneB / Inter / Roboto / 系统中西文回落；`--dsh-font-family-code-default` = JetBrains Mono / SF Mono / Consolas；`--dsw-font-family-brand` = Copernicus / Tiempos Headline / **Cormorant Garamond** / EB Garamond / Garamond / Times New Roman / 中文衬线（宋体、Noto Serif CJK）。
- **标题的编辑体规则** —— markdown 标题（`[data-chat-flow] h1…h4`）走 display 衬线，并强制 **`font-weight: 400`**（设计系统明确「display 字重永不加粗」）与逐级收紧的负字距（h1 -1px / h2 -0.5px / h3-h4 -0.3px）。缺了负字距，衬线标题会立刻变得不像这套设计。
- **圆角刻度** —— `--dsw-radius-xs … xl` 与 `--dsw-radius-panel` = 4 / 6 / 8 / 12 / 16 / 16px（design system 的 rounded 刻度，比平台默认紧一档）。用 `html:root` 而非 `:root` 是为了**不依赖样式表注入顺序**地压过 ui-theme 的 `:root` 声明。
- **层级靠色块，不靠阴影** —— 另覆盖四个阴影令牌（`--dsw-shadow-lv1` / `-lv1-blur` / `-lv2` / `-lv3`）为**暖墨低透明度**阴影，保留必要的浮起分离，但不引入中性黑的重投影；深度主要由 `--dsw-alias-bg-layer-*` 的米色阶与暗色阶提供。
- **用户字体优先** —— ui-theme 把 `--dsw-font-family` 组合成「用户清单, 默认栈」，所以本包只替换默认栈；用户在 Settings 里选的字体依旧排在最前。
- **不需要 `!important`** —— 令牌走常规层叠（body 内联属性 + 样式表的 `html:root`），既没有也不需要覆盖式声明。
- **不 import ui-theme 的类型** —— 已安装闭包里 `dsh-client-ui-theme` 不带 `.d.ts`，所以 `theme.ts` 用本地结构类型 `ThemeTokenHost`（只含 `overrideTokens` 一个成员）描述取到的服务面，既拿到类型也不制造一个假的类型依赖。

**不可回退的不变量**：
- 主题只能通过 `ctx.theme.overrideTokens` 这个扩展点叠加；**不得**直接改 ui-theme 的令牌样式表，也不得替换它的 presenter。
- 每个令牌必须给出 `{ light, dark }` 成对值（ui-theme 会校验，裸字符串直接抛错）；给单值会让用户切换配色后不可读。
- 令牌名必须是 ui-theme 里真实存在的 `--dsw-*` 名；拼错会被静默忽略，表现为某块表面没跟着换色。
- 这是纯呈现：不接入数据、slot 或命令，不产生任何 model-visible 输入，**不得**触发会话事件。
- 注入样式表里的注释**不得含反引号**（模板字符串会被提前终止，导致构建失败）。

## 当前功能：侧边栏面板两列网格（sidebar-panels.ts）

左侧栏顶部的**全局面板列表**（ui-sidebar 的 `nav` → `sidebar.panellist` 行：插件 / Superagent / 自动化任务 / 我的工作台 / 更多）原本是单列、整宽 36px 的行，5 个面板吃掉 5 行高度。本层把它改成**两列网格**，5 行变 3 行，省下的高度归 `sidebar.workspaces`（工作区/会话列表）。

- **挂载方式** —— `apply` 通过 `ctx.effect` 调用 `applySidebarPanelGrid()`，注入一张纯 CSS 样式表（与 `applyThemeStyle` / `applyDshBranding` 同款模式）；卸载时移除。
- **只需 CSS 的原因** —— 这些行就是 ui-sidebar 自己渲染的普通 `<button>`，整个列表是一个 `<nav>`；重排它不需要数据、slot 或命令，所以一串样式规则就是全部改动，React 重渲染也不会撤销。
- **稳定选择器** —— 只用 class **local 名片段**定位，且必须用 `*=`：`[class*="_panelList"]`（nav）、`[class*="_panelRow"]`（行按钮）、`[class*="_panelTitle"]`（行标签）。哈希前缀每次构建都变，绝不写死。
- **不能用 `$=` 后缀匹配（踩过的坑）** —— React 会把状态类**追加**在 local 类后面：选中行是 `…_panelRow …_panelActive`、宽态标签是 `…_panelTitle …_wide`。后缀匹配因此会**恰好漏掉变化了状态的那一行**：选中行掉回 ui-sidebar 自己的 `min-height:36px; padding:7px 8px; line-height:22px` 度量，点一下这一格就长高 4px，整列网格随之抖一下（用户报告的抖动就是这个）。改成片段匹配后所有行都被规则覆盖。
- **盒模型钉死** —— 除了选择器正确，行本身也把 `height: 32px` / `padding: 0 8px` / `line-height: 20px` 写死，nav 再加 `grid-auto-rows: 32px`：即使将来又冒出别的状态类带来不同度量，也不会再把轨道撑开。
- **列数** —— `grid-template-columns: repeat(auto-fit, minmax(104px, 1fr))`：默认栏宽下正好两列；把侧栏拖得很窄时自动退回单列（行标签本来就有 ellipsis，不会溢出）。`> *` 统一 `display: flex; min-width: 0`，因为每行外面包着一层 primitives 的 Tooltip（有无 wrapper 都能撑满）。
- **奇数列收尾** —— `> *:last-child:nth-child(odd)` 让最后一行（当前是「更多」）跨两列，不留下半格空洞。
- **折叠轨道不受影响** —— ui-sidebar 只在轨道态给根元素加 `…_collapsed` local 类，而轨道态的行是固定 36×36 的纯图标按钮。所有规则都挂在 `[class*="_panelList"]:not([class*="_collapsed"] *)` 上，因此只作用于展开态。
- **纯装饰** —— 不接入数据、slot 或命令，不产生任何 model-visible 输入，**不得**触发会话事件。

**不可回退的不变量**：
- 只作用于展开态；折叠轨道（36×36 图标列）**不得**被网格化。
- 定位必须用 local 名**片段**（`*=`），**不得**依赖每次构建会变的 hashed 前缀；也**不得**改成 `$=` 后缀匹配（状态类会被追加在后面，选中行会掉出规则）。
- 行的几何必须钉死（行高 32px + 轨道 32px），**不得**只给 `min-height`：否则任何状态类的度量变化都会让整列抖一下。
- 布局必须能优雅退化：窄栏回落到单列，标签 ellipsis 而不是溢出/换行。
- 这是纯呈现：不接入数据、slot 或命令，不产生任何 model-visible 输入，**不得**触发会话事件。

## 当前功能：侧栏「新会话」主按钮（sidebar-cta.ts）

左侧栏的新会话按钮原本是「中性底（`--dsw-alias-button-elevated-fill`）+ 1px 发丝线 + 墨色文字」，和下面的面板行长得太像，不像是这一列的主操作。本层把它换成 **composer 发送按钮的同一套色值**：填充 `--dsw-alias-button-info-fill`（珊瑚橙）、文字纯白、hover `--dsw-alias-button-info-hover`。两个主操作因此共用同两个令牌，主题改色时一起走。

- **挂载方式** —— `apply` 通过 `ctx.effect` 调用 `applySidebarCta()`，注入纯 CSS 样式表（与 `applySidebarPanelGrid` / `applyDshBranding` 同款）；卸载时移除。
- **稳定选择器** —— `body [class$="_newSession"]:not([class*="_collapsed"] *)`：这里刻意用 **`$=` 后缀**而不是片段匹配，因为同一个前缀家族里还有 `…_newSessionLabel` / `…_newSessionContent` / `…_newSessionShortcut`，用 `*=` 会把它们一起染成珊瑚底。`body` 前缀把特异性抬到 (0,2,0) 以压过 ui-sidebar 的 `[data-platform=darwin]` 与轨道规则，**不用 `!important`**。
- **只作用于展开态** —— 折叠轨道里同一个按钮是 36×36 无边框图标，铺珊瑚橙会变成一块重色点，因此排除。
- **不改变形状** —— 只换色值：圆角、尺寸、内边距、快捷键提示条都还是 ui-sidebar 自己的；hover 时右侧的快捷键 chip 也染成白色（原本是三级文字色）。
- **纯装饰** —— 不接入数据、slot 或命令，不产生任何 model-visible 输入，**不得**触发会话事件。

**不可回退的不变量**：
- 色值必须与 composer 发送按钮同源（`--dsw-alias-button-info-fill` / `-hover` + 白字），**不得**写死新的十六进制色。
- 只作用于展开态；折叠轨道的图标按钮**不得**被填充。
- 定位必须用 local 名后缀，**不得**依赖 hashed 前缀；也**不得**靠 `!important` 抢层级。
- 这是纯呈现：不接入数据、slot 或命令，不产生任何 model-visible 输入，**不得**触发会话事件。

## 当前功能：输入框高亮描边（composer-frame.ts）

composer 的卡片**没有 CSS 边框**：它的边是共享的 elevation 发丝线（`--dsw-elevation-soft` 里的 `0 0 0 .5px`，颜色 `--dsw-alias-border-l2`），和卡片填充 `--dsw-specific-input-major` 是同一档暖米色。在暖纸质主题上这条 0.5px 几乎不可见，输入框读不出「输入框」的形状。本层给它加一圈 **珊瑚色高亮环**，聚焦时加深。

- **用 `outline` 而不是 `border`** —— `border` 会占布局（卡片会变胖 4px、内容重排）；`outline` 不参与布局，且会跟随 `border-radius`，用 `outline-offset: -1px` 压在原发丝线上，尺寸零变化。
- **颜色与主题同源** —— 环色是 `color-mix(in srgb, var(--dsw-alias-brand-primary) 50%, var(--dsw-specific-input-major))`：把珊瑚橙与卡片自身的填充混合，亮色下是暖珊瑚棕、暗色下是压深的珊瑚，两套配色都成立，且主题换色时自动跟随。
- **两档状态** —— 静止 50% 混合、2px；`:focus-within` 升到 85% 混合（`outline-color` 过渡 .15s）。宽度固定 2px：Chromium 在某些缩放档会把小数值的 outline 宽度取整，1.5px 会掉到 1px 而失去分量。
- **稳定锚点** —— `[data-composer-card]`：ui-conversation 给卡片打的稳定 data 属性，不涉及 hashed 类名。
- **纯装饰** —— 不接入数据、slot 或命令，不产生任何 model-visible 输入，**不得**触发会话事件。

**不可回退的不变量**：
- 必须用 `outline`（或等价的零布局方案），**不得**改成 `border` 把卡片撑大。
- 环色必须从 `--dsw-alias-brand-primary` 混出，**不得**写死十六进制色（暗色主题会失配）。
- 定位必须用 `data-composer-card`，**不得**依赖 hashed 类名。
- 这是纯呈现：不接入数据、slot 或命令，不产生任何 model-visible 输入，**不得**触发会话事件。

## 当前功能：品牌改版（branding.ts）

`dsh-ui-interaction` 还在浏览器端挂载一层**品牌改版**（`branding.ts`），去掉 DeepSeek 的鲸鱼/鱼形 logo，**品牌文字保持不变**。

- **挂载方式** —— `apply` 通过 `ctx.effect` 调用 `applyDshBranding()`，注入一段纯 CSS 样式表（与 `theme.ts` 的 `applyThemeStyle` 同款模式）；卸载时移除该样式。
- **dsh 0.1.7 的 slot 拆分** —— 品牌区不再是单个整体 SVG：`sidebar.brand.mark`（logo）与 `sidebar.brand.name`（文字）是两个独立 slot，且 `BrandWordmark` 新增 `includeMark` 开关。内置的 `@deepseek-ai/dsh-client-ui-brand-official` 用 `FishLogo` 填 mark slot、用 `includeMark: false` 的 wordmark（`viewBox="26 0 156 24"`）填 name slot。因此「只去 logo、留文字」现在是精确可达的。
- **稳定 DOM 签名** —— 用 `viewBox` 精确识别 `FishLogo`：`viewBox="0 0 23.16 17.04"` → `display: none`。该签名由 `FISH_LOGO_VIEWBOX`（`{ width: 23.16, height: 17.04 }`）在渲染时以模板字符串拼出，所以 DOM 属性值仍是稳定字面量。**一条规则覆盖全部鱼形标记**：侧栏 mark slot（折叠态工具栏 + 展开态头部）与新会话英雄区的动态鱼形头图（ui-conversation 自己用 `FISH_LOGO_PATH` 组合 svg，但 viewBox 同源）。
- **不隐藏 `0 0 182 24`** —— 那是 `includeMark: true` 的整块 wordmark（鲸鱼 + 文字）。0.1.7 默认不渲染它，且隐藏它会连品牌文字一起隐藏，与「保留品牌文字」相悖。0.1.5 时代隐藏整块 wordmark 的做法**已废弃**。
- **React 安全** —— 用 `display: none` 隐藏而非删除节点：删除会让 React 重新创建并顶掉替换内容；纯 CSS 声明式，React 重渲染不会撤销。
- **纯装饰** —— 不接入数据、slot 或命令，不产生任何 model-visible 输入，**不得**触发会话事件。

**不可回退的不变量**：
- 定位必须用稳定的 `viewBox` 签名（`0 0 23.16 17.04`），**不得**依赖每次构建会变的 hashed 类名。
- 只隐藏 logo；**不得**隐藏 `sidebar.brand.name` 的品牌文字（`26 0 156 24`）。
- 用 `display: none` 隐藏而非删除节点，避免 React 重新创建。
- 这是纯装饰：不接入数据、slot 或命令，不产生任何 model-visible 输入，**不得**触发会话事件。

## 目录结构

```
dsh-ui-interaction/
├── package.json          # 声明 dsh.bundle.patch + dsh.client（双面包）
├── cordis.patch.yml      # 组合层：禁用 ui-model-selection，插入本包行
├── src/
│   ├── index.ts          # 节点端 — 有意为空（纯浏览器 UI）
│   └── client/           # 浏览器端（模型选择 + 外观主题 + 侧栏网格/主按钮 + 输入框描边 + 品牌改版）
│       ├── index.ts      # apply()：服务 + /model popup + composer 席位 + 主题/网格挂载
│       ├── service.ts    # ModelDirectoryResolver（ctx.modelDirectories）
│       ├── catalog.ts    # ModelCatalogDirectory：Host 代次共享的模型目录
│       ├── directory.ts  # 按会话的 ModelDirectory store（catalog + projection）
│       ├── describe.ts   # 行 id 与内置模型描述的本地化（popup 与席位共用）
│       ├── slots.ts      # 席位的注入面类型
│       ├── locales.ts    # `model` 命名空间字典
│       ├── theme.ts      # 暖纸质外观主题：调色板、ui-theme 令牌层、字体与圆角样式表
│       ├── sidebar-panels.ts # 侧边栏全局面板两列网格（纯 CSS）
│       ├── sidebar-cta.ts   # 侧栏「新会话」主按钮：与发送按钮同色值
│       ├── composer-frame.ts # 输入框珊瑚色高亮描边（outline，零布局）
│       ├── branding.ts   # 品牌改版：隐藏鲸鱼/鱼形 logo，保留品牌文字（纯 CSS）
│       ├── ModelSelect.tsx        # 两级「提供商 → 模型」席位
│       └── ModelSelect.module.css
├── scripts/
│   ├── build.mjs         # tsdown 包装器（Windows 上强制 UTF-8 代码页）
│   └── check-pack.mjs    # prepack 门槛：npm pack 前校验组合包完整性
└── tsdown.config.ts      # 节点 ESM + 浏览器 ModuleLoader bundle
```

## 两级下钻交互

composer 席位打开一个根菜单，含 **Model / Effort** 两个单元。Model 下钻**两次**：

1. **providers** —— 提供商组的列表（当前激活的提供商带标记）。点一个进入其内部。
2. **models** —— 仅该提供商的模型，顶部有返回提供商列表的面包屑。

Esc 逐层返回（models → providers → root → 关闭）。`/model` popup 保持不变（它本来就是提供商/明细分组的）。Effort 下钻不变。

## 不可回退的不变量

这些是模型选择表面来之不易的行为。回退任一条都会破坏真实会话。

- **两个入口共享一份按会话的目录。** `/model` popup 与 composer 席位通过 `ctx.modelDirectories` 解析同一个 `ModelDirectory`，任一端切换都会反映到另一端。不要分叉状态。
- **`available` 是 Agent 绑定 RPC 的门槛。** 已寻址 subagent 会话不得暴露任一入口；其目录拒绝加载、选择与重连刷新（`remote.session.selectModel` 与 session binding/projection 订阅会激活持久化的子历史）。
- **composer block 只跟随 `routable`。** 明确的 `false` 使输入停用；`null`（首次加载前或失败后）不得停用，否则慢 Host 会锁死可用 composer。目录成员关系也不阻断（一条仍在服务、只是不再公布该模型的路由完全可用）。
- **被拒绝的 SELECTION 通过瞬时 toast 宣告；菜单内 Retry 条只服务于目录 LOAD。** 由 `lastActionRef` 区分。
- **Esc 先退出最深的窗格。** `models → providers → root → close`。
- **提供商列表（重新）打开时清空当前激活组**，避免陈旧分组跨重载残留。
- **触发器显示模型名 + Effort**（caption 色调），当前选择未被公布时回退到 `选择模型` / `Select model`。
- **不合成陈旧行**：当精确的提供商/模型对离开公布分组时，可路由的选择保持原样，触发器改为提示选择。
- **目录上的代次计数器**：旧响应永不覆盖新响应。

## 新增一个优化功能

在现有两级模型选择之外增加新的交互优化时，遵循本流程：

1. **先看能否复用现有基础结构。** 新优化如果是纯浏览器 UI（如同当前模型选择器），沿用 `dsh.client` 浏览器端 + 空节点端 + `window.__ModuleLoader__.load` bundle 的模式。
2. **在 `cordis.patch.yml` 中明确其接管/覆盖关系。** 若要替换某内置表面，用 `id` + `name` 守卫将其 `disabled: true`，再 `insert` 本包自己的行；不要留下与内置包并存的冲突。
3. **接入缝隙优先于改 loop。** 新行为走 slot 注册、命令贡献、或 ctx 服务等既有扩展点，不要改动 `agent-loop` 或核心会话逻辑。
4. **保持不可回退不变量。** 每个优化在 README/AGENTS 里写清它的不变量与依赖的缝隙。
5. **更新文档。** 本文件的「当前功能」与 README 要随新功能同步更新。

## 构建与编码

```sh
cd plugins/dsh-ui-interaction && pnpm install && pnpm run build
# 或同时运行 prepack 完整性门槛：
pnpm pack
```

`scripts/build.mjs` 在运行 tsdown 前把 Windows 控制台代码页切到 UTF-8（65001）。**中文 Windows（ANSI 代码页 936）上必须如此**：否则 rolldown 把 UTF-8 源码按 CP936 读取，`lib/client.js` 里的中文产品文案会被破坏。POSIX 上该包装器为空操作。

## cordis.patch.yml

组合层禁用内置表面并插入本行：

```yaml
- id: ui-model-selection
  name: "@deepseek-ai/dsh-client-ui-model-selection"
  disabled: true

- insert:
    - id: dsh-ui-interaction
      name: dsh-ui-interaction
```

`name` 必须是**安装到 profile `node_modules` 里的完整包说明符**（pnpm 按真实名称链接包）；裸名解析会失败（`ERR_MODULE_NOT_FOUND`）。`check-pack.mjs` 校验 patch 是否引用了包名。

## 目标 dsh 版本（版本对齐）

本包当前对齐 **dsh 0.1.7-alpha.1**（`dsh --version`；profile 里 `@deepseek-ai/dsh` 的安装版本）。0.1.7 相对 0.1.5-rc.1 的关键变化（任一条都会让旧 bundle 静默失效或类型假绿）：

- **`ModelCatalog` 换家**：`@deepseek-ai/dsh-api-remotes/client` 不再导出 `ModelCatalog`；它现在由 **`@deepseek-ai/dsh-api-session-controller/types`** 导出。从旧路径 import 会得到 `TS2305`。
- **`ctx.remote.session` 的声明在 `./remote` 子路径**：`modelCatalog` / `selectModel` 由 **`@deepseek-ai/dsh-api-session-controller/remote`** 的 `declare module '@deepseek-ai/dsh-typert-protocol'` 声明（生成物 `typert.remote-client.d.ts`）。只 import `/client` 或 `/types` 都**不会**让 `ctx.remote.session` 存在（`TS2339: Property 'session' does not exist on type 'TypertClientRemote'`）。**必须** `import type {} from '@deepseek-ai/dsh-api-session-controller/remote'`。
- **`ctx.remote.$on` 是白名单键**：合法键由 `TypertRemoteEvent = Extract<TypertForwardableEvent, keyof TypertRemoteEventSelection>` 决定，而该 selection 由 `@deepseek-ai/dsh-api-remotes/client` 的 `API_REMOTE_FORWARDED_EVENTS` 合并而来。本包用的 `llm/adapters-updated`、`settings/document-updated`、`credentials/reference-updated` 仍在白名单内；`connection/reset` 走 `ctx.on`（不是 `$on`），也仍在用。
- **图标命名从尺寸后缀改为笔画后缀**：`IconCheckOutline16` / `IconChevronDownOutline14` / `IconDataOutline16` / `IconWarningOutline16` 等**全部消失**，改为 `IconCheckOutlineRegular`、`IconChevronDownOutlineRegular`、`IconChevronLeftOutlineRegular`、`IconChevronRightOutlineRegular`、`IconDataOutlineRegular`、`IconWarningOutlineRegular`（另有 `*Medium` 变体）。旧名在运行时是 `undefined`，渲染即崩。内置 `ui-model-selection` 的 0.1.7 bundle 正是用这组 `*Regular`。
- **`SessionId` 是品牌类型**：`ctx.slots.register` 的 factory `inject` 参数类型是 `SessionIdOf`，它从 `SessionStandardProps` 推导；而 `sessionId: SessionId` 由 **`@deepseek-ai/dsh-client-ui-session/client`** 合并。若该包不在程序里，`SessionIdOf` 退化为 `string`，`sessions.subagentAddress(...)` / `models.directoryFor(...)` 就会报 `TS2345: string is not assignable to SessionId`。这是**类型环境缺包**的假报错，不是源码问题 —— 复核时务必把 `dsh-client-ui-session` 装进临时目录（本包已把它列为 devDep）。
- **品牌区拆成独立 slot**：新增 `@deepseek-ai/dsh-client-ui-brand-official`，品牌 mark 与 name 变成 `sidebar.brand.mark` / `sidebar.brand.name` 两个 slot，`BrandWordmark` 新增 `includeMark`（`true` → `0 0 182 24`，`false` → `26 0 156 24`）。品牌改版的适配见上文。
- **`FishLogo` 的 viewBox 改为模板字符串渲染**（`0 0 ${FISH_LOGO_VIEWBOX.width} ${FISH_LOGO_VIEWBOX.height}`），DOM 属性值仍是 `0 0 23.16 17.04`，所以按 viewBox 的 CSS 定位依旧有效。

0.1.5 相对 0.1.0-rc.5 的变化（历史，仍适用）：

- 浏览器 module table 去掉 `@deepseek-ai/dsh-client-runtime`，store 契约搬到 **`@deepseek-ai/dsh-client-store`**（`createSnapshotStore` / `SnapshotStore` / `ObservableSnapshot`，`update(draft)` 为 immer 语义）。旧 bundle 顶层 `require("@deepseek-ai/dsh-client-runtime/client")` 会**在 factory 阶段抛错** —— 整个插件（主题、品牌、模型选择）一起失效。
- `session.models` RPC 移除 → `ctx.remote.session.modelCatalog()` + session 的 `modelSelection` projection。
- `ctx.slots` 现在由 **`@deepseek-ai/dsh-client-ui-renderer/client`** 声明（旧版在 ui-slots）；ui-slots 只剩纯契约类型。
- 命令贡献的 `description` 从字符串改为 **`() => string`**（每次候选 pass 重新解析）；`ui.popupSelect.options` 多一个 `AbortSignal` 参数。
- 席位菜单改为 **portal + 固定定位**；旧的行属性 `data-time-hover-root` 消失（助手回合尾改为 `data-actions-reveal`，用户消息用 `data-chat-flow-kind="user"`）。
- markdown 内容根的 hashed 类名从 `_markdown_1r4m5_5` 变为 `_markdown_kcgor_5` 之类：**不要写死 hash**，只匹配 local 名片段。

**如何复核对齐（不污染 workspace）**：

1. 在临时目录备一份目标版本的真实类型面包。**推荐直接从已安装的 dsh 闭包拷贝**（`<global node_modules>/@deepseek-ai/dsh/node_modules/@deepseek-ai/`），因为 `npm i` 只装显式列出的包，**传递类型依赖会缺失并产生假报错**。至少要覆盖：`dsh-client-store`、`dsh-api-remotes`、`dsh-api-session-controller`、`dsh-api-gateway`、`dsh-client-connection`、`dsh-client-locale`、`dsh-client-ui-commands`、`dsh-client-ui-conversation`、`dsh-client-ui-input-trigger`、`dsh-client-ui-primitives`、`dsh-client-ui-renderer`、`dsh-client-ui-slots`、**`dsh-client-ui-session`**、`dsh-session`、`dsh-typert-protocol`、`@deepseek-ai/cordis`（+ `cosmokit` / `schemastery`）、`react` / `react-dom` / `@types/react(-dom)`。
   - 若用 `npm i` 先装 react/typescript，注意**它会把先前拷进去的 `@deepseek-ai/*` 全部删掉**，必须先 npm 后拷贝。
2. 把 `src/` 复制进该临时目录，用一个**不继承 workspace `tsconfig.base.json`** 的 tsconfig（`moduleResolution: Bundler`、`allowImportingTsExtensions`、`strict`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`、`noUnusedLocals/Parameters`、`noEmit`）跑 `--noEmit`。**必须不继承**：base 的 `paths` 把 `@deepseek-ai/dsh-*` 指向 workspace 的 0.1.0-rc.5 源码，会给出假绿。
3. 构建不 typecheck（`dts: false`），所以类型只在第 2 步把关；构建后复核实际 external 列表（见下）。

## 依赖与闭包

dsh 0.1.5 起，浏览器端的平台模块由**页面 module table**（seed 模块）提供，不再需要把 dsh 包装进 profile 当 peer。因此本包只声明一个 peer（`@deepseek-ai/cordis`），其余 `@deepseek-ai/*` 全部是**构建/类型期 devDeps**，只用于对照目标 dsh 版本的类型面：`dsh-api-remotes`、`dsh-api-session-controller`、`dsh-client-locale`、`dsh-client-store`、`dsh-client-ui-commands`、`dsh-client-ui-conversation`、`dsh-client-ui-input-trigger`、`dsh-client-ui-primitives`、`dsh-client-ui-renderer`、`dsh-client-ui-slots`、`dsh-client-ui-session`（提供 `SessionStandardProps.sessionId` 的品牌类型合并，类型复核必需）、`dsh-session`、`dsh-typert-protocol`，外加 `tsdown` / `typescript` / `lightningcss` / `@types/react(-dom)` / `clsx` / `react` / `react-dom`。

`dsh.client.inject` 列的是**必须先加载的客户端插件 id**（对应本包 `inject` 需要的服务面）：`@deepseek-ai/dsh-api-remotes`、`@deepseek-ai/dsh-api-session-controller`、`@deepseek-ai/dsh-client-locale`、`@deepseek-ai/dsh-client-ui-commands`。这里**只能**写真的客户端插件：写进去一个纯库（如 `@deepseek-ai/dsh-client-store`）或一个已被移除的包（如 `@deepseek-ai/dsh-client-runtime`），插件 fiber 会永远等待依赖而静默不生效。

> **构建期注意事项（重要）**：浏览器端 externals 必须**只**列 module table 能提供的平台模块。dsh 0.1.7-alpha.1 的表（与 0.1.5 相同，未变）为：`react`、`react/jsx-runtime`、`react-dom`、`react-dom/client`、`@deepseek-ai/cordis`、`@deepseek-ai/dsh-client-store`、`@deepseek-ai/dsh-client-ui-slots`、`@deepseek-ai/dsh-client-ui-primitives`、`@deepseek-ai/dsh-client-ui-dockkit`。**`clsx` 不是平台模块，必须内联** —— 否则运行时会抛 `require("clsx") missed the module table`（一次真实事故）。构建后复核：

```sh
Select-String -Path lib/client.js -Pattern 'require\("([^"]+)"\)' -AllMatches |
  ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
```

## 打包、安装、发布

```sh
# 构建 + 打包（prepack 运行完整性门槛）
cd plugins/dsh-ui-interaction && npm pack     # -> dsh-ui-interaction-0.1.15.tgz

# 安装进 web profile（从源码目录或 tgz 路径均可）
dsh plugin --profile web add D:\path\to\dsh-ui-interaction           # from source dir
dsh plugin --profile web add D:\path\to\dsh-ui-interaction-0.1.15.tgz
dsh plugin --profile web remove dsh-ui-interaction                   # 移除依赖 + 层
# 安装/移除后重启 `dsh web`
```

`package.json` 中 `publishConfig.access` 未设置；仅在真正发布时再添加。**除非明确要求，不要实际 `npm publish`**。不要提交 `.tgz` 与 `node_modules`（已在 gitignore）；**`lib/` 是被 git 跟踪的**（历史如此），改完源码必须重新构建并一起提交，否则安装到 profile 的仍是旧 bundle。`.npmignore` 额外排除 `scripts/`、`src/` 与 ts 配置。

## 编辑本文件

让它与本包的**真实行为**保持同步。当内置 workspace 包 `packages/client/ui-model-selection` 发生行为变化时，仅在本包受影响时才镜像相关契约。
