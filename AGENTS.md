# AGENTS.md

本文件用于管理 `plugins/dsh-ui-interaction/` 内的开发工作。`dsh-ui-interaction` 是一个**自包含的 profile 组合包**，目标是持续优化与改变 DeepSeek Harness Web（dsh web）的交互界面。外层 deepseek-harness 仓库根目录的 `AGENTS.md` 约定仍然适用；本文件补充本包特有的契约与不可回退的不变量。

## 项目定位

**这是一个 dsh web 交互界面的优化集合包**，而不是单个小补丁。它会以「一个 patch 层 + 一个浏览器端插件」的整体形态，逐步叠加多个交互优化。所有优化共享同一套基础结构（`dsh.bundle.patch` 补丁层 + `dsh.client` 浏览器端 + 自包含源码 + 构建/打包流水线），并通过 `cordis.patch.yml` 覆盖/替换内置表面。

**当前已实现的功能**：
1. **模型选择器优化** —— 把 composer 的模型选择从「单一按提供商分组的大列表」改成「先提供商、后模型」的两级下钻。
2. **霓虹氛围背景光晕** —— 为整个 GUI 页面背景叠加多个大小不一的柔和彩色光晕（仅紫、蓝两色），并自备非纯白页面背景（亮色 `#FBFCFE` / 暗色深灰），同时配套调整 composer 输入框（去阴影）与用户消息气泡（加深边框）两处表面。亮/暗主题分别给出合适的强度（整体克制淡雅）。
3. **品牌改版** —— 去掉 DeepSeek 的鲸鱼/鱼形 logo（品牌文字保持不变）：隐藏侧栏 wordmark、新会话英雄区与折叠侧栏的鱼形 logo。

**后续规划**：在本包内继续增加其它交互优化。每个新优化应遵循下文「新增一个优化功能」的流程，并与现有功能在同一 patch 层内共处。

## 当前功能：两级模型选择（provider → model）

`dsh-ui-interaction` 的浏览器端是内置 `@deepseek-ai/dsh-client-ui-model-selection` 表面（composer 的 `conversation.input.model` 席位 + `/model` popupSelect 命令，建立在共享的按会话模型目录之上）的自包含移植，唯一的行为变化是：composer 席位的 Model 下钻现在是**先提供商、再选该提供商的模型**，而不是一个按提供商分组的大列表。

- 它接入与内置版本相同的缝隙：`modelDirectories` 服务（`ModelDirectoryResolver`）、`/model` 命令贡献、`conversation.input.model` slot。
- **数据源（dsh 0.1.5 契约）**：目录不再来自已移除的 `session.models` RPC，而由两者合成 —— 「Host 代次共享目录 `ctx.remote.session.modelCatalog()`」（`catalog.ts` 的 `ModelCatalogDirectory`，一次读取服务全部会话，带 generation 失效）+「本会话持久化的 `modelSelection` projection」（`sessions.binding(id).session.projections.faceOf('modelSelection')`）；提交仍走 `remote.session.selectModel`。两个入口读同一份合成结果。
- **菜单是 portal**：下拉渲染到 `document.body`（`.menu` 为 `position: fixed`，先以 `visibility: hidden` 在原点量一次真实尺寸，再夹取到视口内）。原因是 composer 轨道会滚动/裁剪绝对定位弹层。触发器留在席位自己的布局里，窄容器（`@container (width <= 360px)`）下标签收起、只留前导图标。键盘（Esc / ↑↓）与失焦关闭同时挂在触发器与 portal 菜单上。
- 本包的 `cordis.patch.yml` **禁用**内置的 `ui-model-selection` 行并**插入**本包自己的行。安装后它完全替换内置表面；不会同时启用内置包（两者会在同一 slot 上冲突）。
- **不要**依赖 workspace 包：`D:\plugin\deepseek-harness\packages\client\ui-model-selection` 是 0.1.0-rc.5 的开发副本；对照物是**已安装闭包里的同名包**及其 `lib/types/**/*.d.ts`。

## 当前功能：霓虹氛围背景光晕

`dsh-ui-interaction` 还在浏览器端挂载一层**霓虹氛围背景光晕**（`neon-glow.ts`），作为纯装饰性的全屏背景层，不与任何 slot 或数据交互。

- **挂载方式** —— `apply` 通过 `ctx.effect` 调用 `applyNeonGlow()`，创建固定、透明不拦点击的背景层（`position: fixed; z-index: 0; pointer-events: none`）并 `prepend` 到 `body`；同时注入全局样式。卸载时随 effect 一起移除。
- **提升 `#root`** —— 样式把 `#root` 提升到 `z-index: 1` 的独立层叠上下文，确保 app 内容始终压在光晕之上。
- **光晕层自备页面背景** —— 光晕层 `background` 即为页面背景：亮色 `#FBFCFE`（非纯白、带淡蓝调）、暗色深灰 `rgb(21,21,23)`；光晕 blob 直接画在这层背景之上。
- **基础表面透明** —— 用 `!important` 把 `--dsw-alias-bg-base`、`--dsw-specific-sidebar-fill` 覆盖为 `transparent`，让 app 的基础表面（AppFrame、会话根、侧栏）透出光晕层的背景与光晕。`!important` 同时压过 token 样式表与 theme presenter 写的内联 body token。
- **两色、多光晕、错落大小** —— 紫、蓝两个色调，但以多个尺寸不同的光晕池（56vw ~ 24vw）错落分布四周，缓慢漂移、缩放。每个光晕的颜色与布局是 `BLOBS` 数组的**单一数据源**，内联为 CSS 变量；样式表只承载通用规则、动画 keyframes 与主题开关。
- **配套表面微调** —— 同属本功能的九处样式调整：composer 输入框卡片（`[data-composer-card]`）去掉 `box-shadow`，使其在霓虹背景下呈扁平；用户消息气泡（`[data-chat-flow-kind="user"] [class$="_bubble"]:not([data-pending-steering] *)`）加一条比背景深的边框，作为清晰的消息边界；暗色主题下 markdown 内容根（MarkdownText 的 `css.markdown` 面，以 `[data-chat-flow] div[class*="_markdown_"]` 定位）正文颜色从 `--dsw-alias-label-primary` 降为 `--dsw-alias-label-secondary`；亮色主题下代码块头部横幅（CodeBlock 的 `--dsl-code-block-banner-background-color`，经 `.md-code-block` 根覆盖自定义属性）改为 `--dsw-static-neutral-bluish-00`；亮色主题下 markdown 内联代码块（`[data-chat-flow] [class*="_markdown_"] :not(pre) > code`）背景改为纯白；亮色主题下聊天内容区（`[data-chat-flow]`）内所有背景用 `--dsw-alias-markdown-code-block` 的表面改为纯白（在容器上覆盖该 token，级联到全部后代，不依赖 hashed 类名）；亮色主题下本轮交付文件卡片（dsh-client-ui-deliverables 的 PresentedFileCard，本轮交付的文件卡片，卡片带稳定的 `data-presented-file` 属性）背景从 `--deliverable-fill`（亮色 `--dsw-static-neutral-50`）改为纯白 `--dsw-static-neutral-bluish-00`；消息列（ChatView 的 `.column`，以稳定的 `[data-chat-flow]` 属性定位，而非 hashed 类名）内相邻可见、非空的流条目（`[class$="_flowItem"]` 后缀匹配）之间上边距从 16px 收紧为 4px；左侧侧栏「新会话」按钮（SidebarRoot 的 `.newSession`，以稳定的 `[class$="_newSession"]` 后缀定位，而非 hashed 前缀）改为玻璃拟态样式（半透明磨砂 + `backdrop-filter` 背景模糊 + 内高光与柔影，亮/暗主题分别适配）。
- **主题适配** —— 跟随 `body[data-ds-dark-theme]`：暗色主题稍强的霓虹（`--glow-dark`、中等不透明度）；亮色主题极淡的粉彩（`--glow-light`、低不透明度）。整体克制淡雅，避免过曝。
- **无障碍** —— 尊重 `prefers-reduced-motion`，减弱动画时仅保留静态光晕。

**不可回退的不变量**：
- 光晕层必须 `pointer-events: none`，绝不能拦截任何点击。
- `#root` 必须被提升到光晕之上；否则内容会被装饰层盖住。
- 这是纯装饰：不接入数据、slot 或命令，不产生任何 model-visible 输入，**不得**触发会话事件。
- 配套表面微调的定位必须用稳定的属性/结构选择器（`data-composer-card`、`data-chat-flow`、`data-chat-flow-kind`、`[class$="_bubble"]` / `[class$="_newSession"]` 后缀匹配、`[class*="_markdown_"]` local 名片段匹配），**不得**依赖每次构建会变的完整 hashed 类名。
- 注入的全局样式里的注释**不得含反引号**（模板字符串会被提前终止，导致构建失败）。

## 当前功能：品牌改版（branding.ts）

`dsh-ui-interaction` 还在浏览器端挂载一层**品牌改版**（`branding.ts`），去掉 DeepSeek 的鲸鱼/鱼形 logo（品牌文字保持不变）。

- **挂载方式** —— `apply` 通过 `ctx.effect` 调用 `applyDshBranding()`，注入一段纯 CSS 样式表（与 `applyNeonGlow` 同款模式）；卸载时移除该样式。
- **稳定 DOM 签名** —— 用 `viewBox` 精确识别两个品牌 SVG，不依赖 hashed 类名：
  - `BrandWordmark`（`viewBox="0 0 182 24"`，鲸鱼 + deepseek 字母 + HARNESS 徽标）→ `display: none`；
  - `FishLogo`（`viewBox="0 0 23.16 17.04"`，折叠侧栏工具栏 + 新会话英雄区头图）→ `display: none`。
- **React 安全** —— 用 `display: none` 隐藏而非删除节点：删除会让 React 重新创建并顶掉替换内容；纯 CSS 声明式，React 重渲染不会撤销。
- **纯装饰** —— 不接入数据、slot 或命令，不产生任何 model-visible 输入，**不得**触发会话事件。

**不可回退的不变量**：
- 定位必须用稳定的 `viewBox` 签名（`0 0 182 24` / `0 0 23.16 17.04`），**不得**依赖每次构建会变的 hashed 类名。
- 用 `display: none` 隐藏而非删除节点，避免 React 重新创建。
- 这是纯装饰：不接入数据、slot 或命令，不产生任何 model-visible 输入，**不得**触发会话事件。

## 目录结构

```
dsh-ui-interaction/
├── package.json          # 声明 dsh.bundle.patch + dsh.client（双面包）
├── cordis.patch.yml      # 组合层：禁用 ui-model-selection，插入本包行
├── src/
│   ├── index.ts          # 节点端 — 有意为空（纯浏览器 UI）
│   └── client/           # 浏览器端（模型选择表面 + 霓虹背景光晕）
│       ├── index.ts      # apply()：服务 + /model popup + composer 席位 + 光晕挂载
│       ├── service.ts    # ModelDirectoryResolver（ctx.modelDirectories）
│       ├── catalog.ts    # ModelCatalogDirectory：Host 代次共享的模型目录
│       ├── directory.ts  # 按会话的 ModelDirectory store（catalog + projection）
│       ├── describe.ts   # 行 id 与内置模型描述的本地化（popup 与席位共用）
│       ├── slots.ts      # 席位的注入面类型
│       ├── locales.ts    # `model` 命名空间字典
│       ├── neon-glow.ts  # 霓虹背景光晕层与全局样式
│       ├── branding.ts   # 品牌改版：隐藏鲸鱼/鱼形 logo（纯 CSS）
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

本包当前对齐 **dsh 0.1.5-rc.1**（`dsh --version`；profile 里 `@deepseek-ai/dsh` 的安装版本）。0.1.5 相对 0.1.0-rc.5 的关键变化（任一条都会让旧 bundle 静默失效）：

- 浏览器 module table 去掉 `@deepseek-ai/dsh-client-runtime`，store 契约搬到 **`@deepseek-ai/dsh-client-store`**（`createSnapshotStore` / `SnapshotStore` / `ObservableSnapshot`，`update(draft)` 为 immer 语义）。旧 bundle 顶层 `require("@deepseek-ai/dsh-client-runtime/client")` 会**在 factory 阶段抛错** —— 整个插件（光晕、品牌、模型选择）一起失效。
- `session.models` RPC 移除 → `ctx.remote.session.modelCatalog()` + session 的 `modelSelection` projection。
- `ctx.slots` 现在由 **`@deepseek-ai/dsh-client-ui-renderer/client`** 声明（旧版在 ui-slots）；ui-slots 只剩纯契约类型。
- 命令贡献的 `description` 从字符串改为 **`() => string`**（每次候选 pass 重新解析）；`ui.popupSelect.options` 多一个 `AbortSignal` 参数。
- 席位菜单改为 **portal + 固定定位**；旧的行属性 `data-time-hover-root` 消失（助手回合尾改为 `data-actions-reveal`，用户消息用 `data-chat-flow-kind="user"`）。
- markdown 内容根的 hashed 类名从 `_markdown_1r4m5_5` 变为 `_markdown_kcgor_5` 之类：**不要写死 hash**，只匹配 local 名片段。

**如何复核对齐（不污染 workspace）**：

1. 在临时目录 `npm i` 一份目标版本的真实类型面包（`@deepseek-ai/dsh-client-store`、`dsh-api-remotes`、`dsh-api-session-controller`、`dsh-client-locale`、`dsh-client-ui-commands`、`dsh-client-ui-conversation`、`dsh-client-ui-input-trigger`、`dsh-client-ui-primitives`、`dsh-client-ui-renderer`、`dsh-client-ui-slots`、`dsh-session`、`dsh-typert-protocol`、`@deepseek-ai/cordis`、`react`/`react-dom`/`@types/*`）。
2. 把 `src/` 复制进该临时目录，用一个**不继承 workspace `tsconfig.base.json`** 的 tsconfig（`moduleResolution: Bundler`、`allowImportingTsExtensions`、`strict`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`、`noUnusedLocals/Parameters`、`noEmit`）跑 `--noEmit`。**必须不继承**：base 的 `paths` 把 `@deepseek-ai/dsh-*` 指向 workspace 的 0.1.0-rc.5 源码，会给出假绿。
3. 构建不 typecheck（`dts: false`），所以类型只在第 2 步把关；构建后复核实际 external 列表（见下）。

## 依赖与闭包

dsh 0.1.5 起，浏览器端的平台模块由**页面 module table**（seed 模块）提供，不再需要把 dsh 包装进 profile 当 peer。因此本包只声明一个 peer（`@deepseek-ai/cordis`），其余 `@deepseek-ai/*` 全部是**构建/类型期 devDeps**，只用于对照目标 dsh 版本的类型面：`dsh-api-remotes`、`dsh-api-session-controller`、`dsh-client-locale`、`dsh-client-store`、`dsh-client-ui-commands`、`dsh-client-ui-conversation`、`dsh-client-ui-input-trigger`、`dsh-client-ui-primitives`、`dsh-client-ui-renderer`、`dsh-client-ui-slots`、`dsh-session`、`dsh-typert-protocol`，外加 `tsdown` / `typescript` / `lightningcss` / `@types/react(-dom)` / `clsx` / `react` / `react-dom`。

`dsh.client.inject` 列的是**必须先加载的客户端插件 id**（对应本包 `inject` 需要的服务面）：`@deepseek-ai/dsh-api-remotes`、`@deepseek-ai/dsh-api-session-controller`、`@deepseek-ai/dsh-client-locale`、`@deepseek-ai/dsh-client-ui-commands`。这里**只能**写真的客户端插件：写进去一个纯库（如 `@deepseek-ai/dsh-client-store`）或一个已被移除的包（如 `@deepseek-ai/dsh-client-runtime`），插件 fiber 会永远等待依赖而静默不生效。

> **构建期注意事项（重要）**：浏览器端 externals 必须**只**列 module table 能提供的平台模块。dsh 0.1.5-rc.1 的表为：`react`、`react/jsx-runtime`、`react-dom`、`react-dom/client`、`@deepseek-ai/cordis`、`@deepseek-ai/dsh-client-store`、`@deepseek-ai/dsh-client-ui-slots`、`@deepseek-ai/dsh-client-ui-primitives`、`@deepseek-ai/dsh-client-ui-dockkit`。**`clsx` 不是平台模块，必须内联** —— 否则运行时会抛 `require("clsx") missed the module table`（一次真实事故）。构建后复核：

```sh
Select-String -Path lib/client.js -Pattern 'require\("([^"]+)"\)' -AllMatches |
  ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
```

## 打包、安装、发布

```sh
# 构建 + 打包（prepack 运行完整性门槛）
cd plugins/dsh-ui-interaction && npm pack     # -> dsh-ui-interaction-0.1.4.tgz

# 安装进 web profile（从源码目录或 tgz 路径均可）
dsh plugin --profile web add D:\path\to\dsh-ui-interaction           # from source dir
dsh plugin --profile web add D:\path\to\dsh-ui-interaction-0.1.4.tgz
dsh plugin --profile web remove dsh-ui-interaction                   # 移除依赖 + 层
# 安装/移除后重启 `dsh web`
```

`package.json` 中 `publishConfig.access` 未设置；仅在真正发布时再添加。**除非明确要求，不要实际 `npm publish`**。不要提交 `.tgz` 与 `node_modules`（已在 gitignore）；**`lib/` 是被 git 跟踪的**（历史如此），改完源码必须重新构建并一起提交，否则安装到 profile 的仍是旧 bundle。`.npmignore` 额外排除 `scripts/`、`src/` 与 ts 配置。

## 编辑本文件

让它与本包的**真实行为**保持同步。当内置 workspace 包 `packages/client/ui-model-selection` 发生行为变化时，仅在本包受影响时才镜像相关契约。
