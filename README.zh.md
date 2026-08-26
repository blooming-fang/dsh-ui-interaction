# dsh-ui-interaction

[English](README.md) | 中文

**dsh web 交互界面的优化集合包**。作为一个自包含的 profile 组合包，持续优化与改变 DeepSeek Harness Web（dsh web）的交互体验：它以一个 patch 层 + 浏览器端插件的整体形态，逐步叠加多个交互优化，并通过 `cordis.patch.yml` 覆盖/替换内置表面。安装到 `web` profile 后即刻生效，无需改动 dsh 本体。

## 当前已实现的功能

### 模型选择器优化（provider → model 两级下钻）

把 composer 的模型选择从「单一按提供商分组的大列表」改为**先提供商、后模型**的两级选择：

1. **提供商** —— 可用提供商组的列表（当前激活的提供商带有标记）。点击一个进入其内部。
2. **模型** —— 仅该提供商的模型，顶部带有返回提供商列表的面包屑。

Esc 逐层返回（模型 → 提供商 → 根 → 关闭）。`/model` 命令与推理等级下钻保持不变。

## 后续规划

本包会继续加入其它交互优化。每个新优化都在同一 patch 层内、按统一的接入缝隙（slot 注册、命令贡献、ctx 服务）叠加，并附带有明确的接管/覆盖关系。新增功能的流程见 [AGENTS.md](AGENTS.md#新增一个优化功能)。

## 安装

```sh
# 构建并打包（prepack 会运行完整性校验）
cd plugins/dsh-ui-interaction
pnpm install && pnpm run build
npm pack                                    # -> dsh-ui-interaction-0.1.0.tgz

# 安装到 web profile 并重启 `dsh web`
dsh plugin --profile web add D:\path\to\dsh-ui-interaction-0.1.0.tgz
dsh plugin --profile web remove dsh-ui-interaction   # 卸载
```

在中文 Windows（ANSI 代码页 936）上，构建需强制使用 UTF-8；`scripts/build.mjs` 会自动处理。参见 [AGENTS.md](AGENTS.md#构建与编码)。

## 工作原理

本包是一个双面（dual-face）包：其 `cordis.patch.yml` 禁用被替换的内置表面行（当前为 `ui-model-selection`）并插入本包自己的行；`dsh.client` 浏览器端在同一 slot/命令上提供替换实现。就当前模型选择器而言：两个入口（composer 席位与 `/model`）共享一份按会话的模型目录（`session.models` / `session.selectModel`），任一端做出的切换都会反映到另一端——语义与内置版本一致。

## 开发

- `src/client/ModelSelect.tsx` —— 两级「提供商 → 模型」席位组件。
- `src/client/directory.ts` 与 `service.ts` —— 共享的按会话目录与 `modelDirectories` 服务。
- `cordis.patch.yml` —— 禁用被替换表面并插入本包的层。
- 参见 [AGENTS.md](AGENTS.md) 了解包契约、不可回退的不变量与新增功能的流程。

## 许可证

MIT
