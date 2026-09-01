# dsh-ui-interaction

**dsh web 交互界面的优化集合包**。作为一个自包含的 profile 组合包，持续优化与改变 DeepSeek Harness Web（dsh web）的交互体验：它以一个 patch 层 + 浏览器端插件的整体形态，逐步叠加多个交互优化，并通过 `cordis.patch.yml` 覆盖/替换内置表面。安装到 `web` profile 后即刻生效，无需改动 dsh 本体。

## 当前已实现的功能

### 模型选择器优化（provider → model 两级下钻）

把 composer 的模型选择从「单一按提供商分组的大列表」改为**先提供商、后模型**的两级选择：

1. **提供商** —— 可用提供商组的列表（当前激活的提供商带有标记）。点击一个进入其内部。
2. **模型** —— 仅该提供商的模型，顶部带有返回提供商列表的面包屑。

Esc 逐层返回（模型 → 提供商 → 根 → 关闭）。`/model` 命令与推理等级下钻保持不变。

### 霓虹氛围背景光晕

为整个 GUI 页面背景叠加**多个大小不一的柔和彩色光晕**（仅紫、蓝两色），营造克制的霓虹氛围。光晕是固定、透明不拦点击的装饰层，铺在 app 内容之下（`#root` 被提升到光晕之上）。

- **两色、多光晕、错落大小** —— 紫与蓝两个色调，但以多个尺寸不同的光晕池（56vw ~ 24vw）错落分布在页面四周，各自缓慢漂移、缩放。
- **淡雅克制** —— 光晕强度刻意压低：亮色主题几乎不可察觉，暗色主题稍强但仍属氛围而非饱和色块。
- **主题适配** —— 跟随 body 的 `data-ds-dark-theme` 自动切换，无需 JS。
- **无障碍** —— 尊重 `prefers-reduced-motion`，减弱动画时仅保留静态光晕。

## 后续规划

本包会继续加入其它交互优化。每个新优化都在同一 patch 层内、按统一的接入缝隙（slot 注册、命令贡献、ctx 服务）叠加，并附带有明确的接管/覆盖关系。

## 安装

需要一个已初始化的 web profile。从 npm 安装（已发布）：

```sh
dsh plugin --profile web add dsh-ui-interaction
```

然后重启 `dsh web` 并打开 GUI。

`dsh plugin --profile web remove dsh-ui-interaction` 同时移除依赖与 bundle 层，恢复内置模型选择器。

## 工作原理

本包是一个双面（dual-face）包：其 `cordis.patch.yml` 禁用被替换的内置表面行（当前为 `ui-model-selection`）并插入本包自己的行；`dsh.client` 浏览器端在同一 slot/命令上提供替换实现。就当前模型选择器而言：两个入口（composer 席位与 `/model`）共享一份按会话的模型目录（`session.models` / `session.selectModel`），任一端做出的切换都会反映到另一端——语义与内置版本一致。霓虹光晕背景则是纯装饰层：浏览器端 `apply` 挂载一个固定的全屏层与全局样式，随插件生命周期挂载/卸载，不接入任何 slot 或数据。

## 开发者

- `src/client/ModelSelect.tsx` —— 两级「提供商 → 模型」席位组件。
- `src/client/directory.ts` 与 `service.ts` —— 共享的按会话目录与 `modelDirectories` 服务。
- `src/client/neon-glow.ts` —— 霓虹背景光晕层与全局样式。
- `cordis.patch.yml` —— 禁用被替换表面并插入本包的层。
- 参见 [AGENTS.md](AGENTS.md) 了解包契约、不可回退的不变量与新增功能的流程。

### 本地开发打包（可选）

普通用户无需这一步——直接 `dsh plugin --profile web add dsh-ui-interaction` 从 npm 安装即可。仅当你在本地开发、需要手动打包时：

```sh
cd plugins/dsh-ui-interaction
pnpm install && pnpm run build
npm pack
# 生成 dsh-ui-interaction-0.1.0.tgz
```

在中文 Windows（ANSI 代码页 936）上，构建需强制使用 UTF-8；`scripts/build.mjs` 会自动处理。参见 [AGENTS.md](AGENTS.md#构建与编码)。

## 许可证

MIT
