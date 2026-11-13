# dsh-ui-interaction

**dsh web 交互界面的优化集合包**。作为一个自包含的 profile 组合包，持续优化与改变 DeepSeek Harness Web（dsh web）的交互体验：它以一个 patch 层 + 浏览器端插件的整体形态，逐步叠加多个交互优化，并通过 `cordis.patch.yml` 覆盖/替换内置表面。安装到 `web` profile 后即刻生效，无需改动 dsh 本体。

## 当前已实现的功能

### 模型选择器优化（provider → model 两级下钻）

把 composer 的模型选择从「单一按提供商分组的大列表」改为**先提供商、后模型**的两级选择：

1. **提供商** —— 可用提供商组的列表（当前激活的提供商带有标记）。点击一个进入其内部。
2. **模型** —— 仅该提供商的模型，顶部带有返回提供商列表的面包屑。

Esc 逐层返回（模型 → 提供商 → 根 → 关闭）。`/model` 命令与推理等级下钻保持不变。

菜单渲染在 `document.body` 上（`position: fixed`，先以隐藏态量一次真实尺寸再夹取到视口内），因为 composer 轨道会滚动并裁剪绝对定位的弹层；窄容器下触发器收起文字、只留前导图标。

> 当前对齐 **dsh 0.1.7-alpha.1**：目录来自 Host 代次共享的 `modelCatalog` + 本会话持久化的 `modelSelection` projection，提交走 `remote.session.selectModel`。详见 [AGENTS.md](AGENTS.md#目标-dsh-版本版本对齐)。

### 原生 Agent Teams 选项恢复（0.1.23）

在恢复版 0.1.21 基础上，补回模型菜单的 conversation.input.model.options 原生扩展槽。“启用智能体团队”由宿主 ui-agent-team 原组件贡献，不复制开关、不另建状态或提交路径；保留原生投影、提交忙状态、失败提示和关闭确认。方向键纳入团队 Switch，保存中禁用控件的短暂失焦不会误关菜单；选项异步出现时重新定位菜单。

此修复不重新启用此前回退的新增动效或滚动条模块。按要求仅构建打包，不运行测试、不自动安装。

### 外观主题：暖纸质（warm paper）

把一整套设计令牌（珊瑚橙主色 + 暖米白画布 + 同族暖炭黑暗色面）折进 ui-theme 的别名令牌层，整个 GUI 一键换肤，不改任何组件：

- **主色** —— 珊瑚橙 `#cc785c`（按下态 `#a9583e`、禁用态 `#e6dfd8`），用作品牌色、主按钮填充、发送按钮、链接、选中态与焦点环。
- **亮色面** —— 画布 `#f5f0e4`；三级米色抬升面 `#efe9db` / `#e9e1d1` / `#e1d7c4`；文字阶梯 `#141413` → `#3d3d3a` → `#6c6a64` → `#857f74`；发丝线 `#dfd5c5` / `#e6ddcd`。
- **暗色面** —— 画布 `#1e1c18`；抬升面 `#26231e` / `#2c2924` / `#35312a`；文字 `#efebe4` / `#a8a49c` / `#918d84`；主色仍为珊瑚橙（在暖炭黑上 5.5:1），强调文字改用浅珊瑚 `#e0997c`。
- **不刺眼** —— 比设计系统原值整条下压约 7% 亮度（画布 `#faf9f5` → `#f5f0e4`，相对亮度 0.947 → 0.873），暖色相不变、正文对比度反而更高；暗色则把画布抬高一点、最亮文字从纯白降到 `#efebe4`，避免「纯黑 + 纯白」的硬对比。
- **纳入主题的表面** —— 页面/卡片/弹层/菜单（半透明暖米白 + 背景模糊）、侧栏、用户气泡、composer 输入卡、markdown 代码块与内联代码、diff 底色、滚动条、toast/tooltip、设置卡片，以及会话状态色（成功/警告/错误）全部随调色板走。
- **排版** —— 复刻设计系统的「编辑体衬线标题 + humanist sans 正文」拆分：正文/界面用 StyreneB / Inter（回落系统中西文字体），代码用 JetBrains Mono / SF Mono；markdown 标题与品牌文字用 Copernicus / Tiempos Headline（回落 Cormorant Garamond / EB Garamond / Garamond，中文回落宋体），并强制 **衬线字重 400 + 负字距**（h1 -1px / h2 -0.5px / h3-h4 -0.3px）——设计系统里 display 字重永不加粗。
- **圆角** —— 采用设计系统更克制的一档：4 / 6 / 8 / 12 / 16px。
- **层级靠色块** —— 覆盖四个阴影令牌为暖墨低透明度阴影，深度主要由米色/暗色阶提供，不引入中性黑重投影（设计原则：color-block first, shadow rare）。
- **跟随用户偏好** —— 亮/暗（含 `system`）仍由 Settings 决定，主题只覆盖颜色与字形，不会抢走用户选择；用户自选字体依旧优先于主题默认字体栈。
- **克制且可逆** —— 单一 `overrideTokens` 图层，插件卸载即整体撤下，恢复内置调色板。

### 侧边栏面板两列网格

左侧栏顶部的全局面板行（插件 / Superagent / 自动化任务 / 我的工作台 / 更多）从**单列改成两列网格**：

- **省高度** —— 5 个面板从 5 行压到 3 行（每行 32px），中间省下的接近 80px 全部还给下面的工作区/会话列表。
- **列数自适应** —— `repeat(auto-fit, minmax(104px, 1fr))`：默认栏宽下正好两列；把侧栏拖得很窄时自动退回单列，标签用省略号而不是溢出。
- **奇数列收尾** —— 面板数为奇数时，最后一行（「更多」）跨两列，不留半格空洞。
- **折叠轨道保持不变** —— 收起侧栏后的纯图标轨道仍是单列 36×36。
- **不抖** —— 行高与网格轨道都钉死在 32px。class 用 local 名**片段**匹配（`[class*="_panelRow"]`）：React 会把 `_panelActive` / `_wide` 这类状态类追加在后面，若用后缀匹配，选中那一行会掉出规则、回到 ui-sidebar 的 36px 度量，点一下整列就抖一下。
- **纯 CSS** —— 只按 class local 名片段定位，不改组件、不接数据，React 重渲染不会撤销。

### 侧栏「新会话」主按钮

新会话按钮不再用「中性底 + 发丝线」，改为与 composer 发送按钮**同一套色值**：珊瑚橙填充（`--dsw-alias-button-info-fill`）、白色文字与图标、hover 走 `--dsw-alias-button-info-hover`。两个主操作共用同两个令牌，主题换色时一起走；形状、尺寸、快捷键提示条都不动，折叠轨道的图标按钮也不受影响。

### 输入框高亮描边

composer 原本只有一条和卡片底色同调的 0.5px 发丝线（共享的 elevation 描边），在暖米色主题上几乎看不见。现在加一圈珊瑚色环：**1px**（珊瑚 65% 混入卡片填充），聚焦时加深到 90%。用 `outline` 而不是 `border`，所以卡片尺寸与内容布局完全不变；颜色从 `--dsw-alias-brand-primary` 混出，亮/暗主题都成立。

### 全站过渡动效

产品原本几乎没有任何过渡：743 条会改变颜色的 hover / focus 状态规则里只有 11.7% 声明了 `transition`，primitives 的 Button / Input / Menu / Pill / Tag 更是零过渡，所以所有交互都是「一帧硬切」。本层补上这个底座：

- **只过渡颜色** —— `background-color` / `color` / `border-color` / `outline-color` / `box-shadow` / `opacity`，hover 与 focus 100ms `ease-out`，阴影 200ms；**不碰任何尺寸与 `transform`**，不会重排布局，也不会和组件自己的动效（侧栏轨道、开关拇指、菜单淡入）打架。
- **特异性归零** —— 选择器整体包在 `:where()` 里，组件自己声明的过渡（以及拖动侧栏时平台的「关掉过渡」开关）永远优先，本层只补空缺。
- **覆盖范围** —— 底座直接铺到 `html` / `body` / `body *`，不按类名挑选：产品的 CSS-module 类名带哈希又是驼峰（`_sessionRow` / `_cardMain`），按片段枚举会整族漏掉，而只过渡颜色属性铺满全站是安全的 —— 不改色的元素不付代价。侧栏行、工作区行、插件卡、设置项、输入框、菜单项因此一起变柔和。
- **顺带修掉的一处** —— 侧栏「新会话」右侧的快捷键 chip 原本靠 `opacity` 0→1 硬跳出，现在淡入。
- **尊重减动效偏好** —— 整层包在 `@media (prefers-reduced-motion: no-preference)` 内，系统设为减少动态时本层不存在。
- **换主题不淡入** —— 切换明暗会重写全部令牌，如果放任底座，全站会一起淡过去。所以本层监听 ui-theme 的 `theme/change`，在事件里给 `html` 打上 `data-dshui-motion-off`（该状态下所有过渡为 `none`），两帧后新配色已画完再摘掉 —— 主题切换依旧是瞬时换色。

### 品牌改版：去掉 logo，保留品牌文字

去掉 DeepSeek 的鲸鱼/鱼形 logo，**品牌文字保持不变**：

- **鲸鱼/鱼形 logo** —— 隐藏 `FishLogo`（`viewBox="0 0 23.16 17.04"`）。一条规则覆盖全部鱼形标记：侧栏品牌 mark slot（折叠态工具栏与展开态头部）以及新会话英雄区的动态鱼形头图。
- **品牌文字保留** —— 侧栏 `sidebar.brand.name` 渲染的无 logo wordmark（`viewBox="26 0 156 24"`，即「deepseek HARNESS」文字）**不再隐藏**。0.1.7 把 logo 与文字拆成了两个独立 slot（`sidebar.brand.mark` / `sidebar.brand.name`）并给 `BrandWordmark` 加了 `includeMark` 开关，因此「只去 logo、留文字」现在是精确可达的；0.1.5 时代整块隐藏 wordmark 的做法已废弃（那会连品牌文字一起隐藏）。
- **实现方式** —— 纯 CSS，用稳定 `viewBox` 签名隐藏 logo，不依赖 hashed 类名；`display:none` 隐藏而非删除，React 重渲染不会撤销；纯装饰，不接入数据或 slot。

## 后续规划

本包会继续加入其它交互优化。每个新优化都在同一 patch 层内、按统一的接入缝隙（slot 注册、命令贡献、ctx 服务）叠加，并附带有明确的接管/覆盖关系。

## 插件卡片

在「插件」面板里本包显示为一块珊瑚色图标（`icon.svg`，36×36 viewBox）+ 中文标题与一句话介绍（`locale/zh.json`，`locale/en.json` 作为基准）。图标与文案都是包内静态资源：`package.json` 的 `icon` 指向图标，`locale/*.json` 提供 `meta.title` / `meta.description` 并在 `exports` 中导出；两者缺失时卡片会退回默认图标 + 包名 + `description`。

## 安装

需要一个已初始化的 web profile。从 npm 安装（已发布）：

```sh
dsh plugin --profile web add dsh-ui-interaction
```

然后重启 `dsh web` 并打开 GUI。

`dsh plugin --profile web remove dsh-ui-interaction` 同时移除依赖与 bundle 层，恢复内置模型选择器。

## 工作原理

本包是一个双面（dual-face）包：其 `cordis.patch.yml` 禁用被替换的内置表面行（当前为 `ui-model-selection`）并插入本包自己的行；`dsh.client` 浏览器端在同一 slot/命令上提供替换实现。就当前模型选择器而言：两个入口（composer 席位与 `/model`）共享一份按会话的模型目录——由「Host 代次共享的模型目录 `remote.session.modelCatalog()`」与「本会话持久化的 `modelSelection` projection」合成，提交走 `remote.session.selectModel`；任一端做出的切换都会反映到另一端，语义与内置版本一致。

外观主题则挂在 ui-theme 的官方扩展点上：`apply` 通过 `ctx.inject(['theme'], …)` 取到 ui-theme 的 `ctx.theme` 服务，用 `overrideTokens(source, { light, dark })` 压上一层令牌（每个令牌都给出亮/暗两个值，因此一层覆盖两种配色），由 ui-theme 自己的 presenter 写进 `body` 的内联自定义属性；另有一张插件自带样式表承载 `:root` 级默认字体栈、圆角刻度与 markdown 标题的衬线字体。整层随插件卸载一起撤下。

## 开发者

- `src/client/ModelSelect.tsx` —— 两级「提供商 → 模型」席位组件（菜单 portal 到 `document.body`）。
- `src/client/directory.ts` 与 `service.ts` —— 共享的按会话目录与 `modelDirectories` 服务。
- `src/client/catalog.ts` —— Host 代次共享的模型目录（`remote.session.modelCatalog()`）。
- `src/client/describe.ts` —— 行 id 与内置模型描述的本地化。
- `src/client/theme.ts` —— 暖纸质外观主题：调色板（亮/暗成对）、ui-theme 令牌图层与字体/圆角样式表。
- `src/client/sidebar-panels.ts` —— 侧边栏全局面板的两列网格（纯 CSS，仅展开态）。
- `src/client/sidebar-cta.ts` —— 侧栏「新会话」主按钮：与发送按钮同色值（纯 CSS，仅展开态）。
- `src/client/composer-frame.ts` —— 输入框珊瑚色高亮描边（outline，零布局）。
- `src/client/motion.ts` —— 全站过渡动效：颜色/阴影/透明度底座（纯 CSS，零几何改动）。
- `src/client/branding.ts` —— 品牌改版：隐藏鲸鱼/鱼形 logo，保留品牌文字（纯 CSS）。
- `cordis.patch.yml` —— 禁用被替换表面并插入本包的层。
- 参见 [AGENTS.md](AGENTS.md) 了解包契约、不可回退的不变量与新增功能的流程。

### 本地开发打包（可选）

普通用户无需这一步——直接 `dsh plugin --profile web add dsh-ui-interaction` 从 npm 安装即可。仅当你在本地开发、需要手动打包时：

```sh
cd plugins/dsh-ui-interaction
pnpm install && pnpm run build
npm pack
# 生成 dsh-ui-interaction-0.1.23.tgz
```

在中文 Windows（ANSI 代码页 936）上，构建需强制使用 UTF-8；`scripts/build.mjs` 会自动处理。参见 [AGENTS.md](AGENTS.md#构建与编码)。

## 许可证

MIT
