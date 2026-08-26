# dsh-ui-interaction

English | [中文](README.zh.md)

**A bundle for optimizing and reshaping the dsh web interaction experience.** This self-contained profile bundle progressively layers UI/interaction improvements over the DeepSeek Harness Web GUI: a patch layer plus a browser-side plugin that override or replace built-in surfaces via `cordis.patch.yml`. Install it into the `web` profile and it takes effect without touching the dsh core.

## Current feature

### Model picker optimization (provider → model two-level drill-down)

Changes the composer's model picker from one provider-grouped list to a **provider-first, two-step** selection:

1. **Providers** — the list of available provider groups (the active provider is marked). Click one to drill in.
2. **Models** — that provider's models only, with a back breadcrumb to the provider list.

Escape backs out one level at a time (models → providers → root → close). The `/model` command and the reasoning-effort drill are unchanged.

## Roadmap

More interaction optimizations will be added to this bundle over time. Each new feature layers onto the same patch layer through the established seams (slot registration, command contributions, ctx services) with an explicit override relationship. See [AGENTS.md](AGENTS.md#新增一个优化功能) for the flow.

## Install

```sh
# build and pack (prepack runs a completeness gate)
cd plugins/dsh-ui-interaction
pnpm install && pnpm run build
npm pack                                    # -> dsh-ui-interaction-0.1.0.tgz

# install into the web profile and restart `dsh web`
dsh plugin --profile web add D:\path\to\dsh-ui-interaction-0.1.0.tgz
dsh plugin --profile web remove dsh-ui-interaction   # to uninstall
```

On Chinese-locale Windows (ANSI code page 936), build with UTF-8 forced; `scripts/build.mjs` does this automatically. See [AGENTS.md](AGENTS.md#构建与编码).

## How it works

This bundle is a dual-face package: its `cordis.patch.yml` disables the replaced built-in surface row (currently `ui-model-selection`) and inserts this bundle's own row; the `dsh.client` browser half serves the replacement over the same slot/command. For the current model picker: both entries (the composer seat and `/model`) share one per-session model directory (`session.models` / `session.selectModel`), so a switch in either surface is what the other shows next — the same semantics as the built-in.

## Development

- `src/client/ModelSelect.tsx` — the two-level provider→model seat.
- `src/client/directory.ts` + `service.ts` — the shared per-session directory and `modelDirectories` service.
- `cordis.patch.yml` — the layer that disables the replaced surface and inserts this bundle.
- See [AGENTS.md](AGENTS.md) for the bundle contract, non-negotiable invariants, and the add-a-feature flow.

## License

MIT
