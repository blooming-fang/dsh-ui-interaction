window.__ModuleLoader__.load({
	id: "dsh-ui-interaction",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let react = require("react");
		let react_dom = require("react-dom");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/locales.ts
		/**
		* `model` namespace dictionaries.
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
		const zh = {
			"command.description": "选择本会话使用的模型",
			"option.loadError": "目录加载失败：{message}",
			"option.deepseekV4Flash.description": "快速、高效且经济；适合目标明确、常规或并行任务。",
			"option.deepseekV4Pro.description": "更强的自主编码、知识与复杂推理能力；适合复杂或质量优先的任务，但成本更高。",
			"trigger.fallback": "选择模型",
			"trigger.loading": "正在加载模型…",
			"trigger.selectAria": "选择模型",
			"trigger.aria": "选择模型，当前 {model}",
			"trigger.ariaEffort": "选择模型，当前 {model}，推理等级 {effort}",
			"menu.aria": "模型与推理等级",
			"menu.model": "模型",
			"menu.effort": "推理等级",
			"effort.providerDefault": "Default",
			"status.loading": "正在刷新模型列表…",
			"error.action": "模型操作失败：{message}",
			"action.reload": "重新加载",
			"warning.groupLoad": "{name} 加载失败：{message}",
			"empty.models": "没有可用的模型。",
			"empty.providers": "没有可用的提供商。",
			"blocked.composer": "当前模型不可用，请先选择模型",
			"empty.efforts": "当前模型未提供推理等级。"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"command.description": "Select the model for this conversation",
			"option.loadError": "Catalog failed to load: {message}",
			"option.deepseekV4Flash.description": "Fast, efficient, and economical; suited to focused, routine, or parallel tasks.",
			"option.deepseekV4Pro.description": "Stronger agentic coding, knowledge, and difficult reasoning; suited to complex or quality-critical tasks at higher cost.",
			"trigger.fallback": "Select model",
			"trigger.loading": "Loading models…",
			"trigger.selectAria": "Select model",
			"trigger.aria": "Select model, current {model}",
			"trigger.ariaEffort": "Select model, current {model}, reasoning effort {effort}",
			"menu.aria": "Model and reasoning effort",
			"menu.model": "Model",
			"menu.effort": "Effort",
			"effort.providerDefault": "Default",
			"status.loading": "Refreshing model list…",
			"error.action": "Model operation failed: {message}",
			"action.reload": "Reload",
			"warning.groupLoad": "{name} failed to load: {message}",
			"empty.models": "No models available.",
			"empty.providers": "No providers available.",
			"blocked.composer": "This model is unavailable — select one to continue",
			"empty.efforts": "This model provides no reasoning effort levels."
		};
		//#endregion
		//#region src/client/describe.ts
		/** One selectable row's id: an opaque row key (resolved by lookup, never parsed). */
		function rowId(providerId, modelId) {
			return `${providerId}/${modelId}`;
		}
		/**
		* Built-in provider rows whose Host-advertised description is English prose
		* rather than provider-authored free text. Keyed by row id; the value names the
		* dictionary key carrying the localized copy.
		*/
		const BUILTIN_DESCRIPTION_KEYS = {
			"deepseek-official/deepseek-v4-flash": "option.deepseekV4Flash.description",
			"deepseek-official/deepseek-v4-pro": "option.deepseekV4Pro.description"
		};
		/**
		* Localize a model description, keeping provider-authored text verbatim.
		* @param providerId - the owning provider group id.
		* @param model - the advertised model.
		* @param t - the bound namespace translator.
		* @returns the description to render, or undefined when the model carries none.
		*/
		function descriptionOf(providerId, model, t) {
			const key = BUILTIN_DESCRIPTION_KEYS[rowId(providerId, model.id)];
			return key !== void 0 && model.description === en[key] ? t(key) : model.description;
		}
		//#endregion
		//#region \0@oxc-project+runtime@0.135.0/helpers/esm/typeof.js
		function _typeof(o) {
			"@babel/helpers - typeof";
			return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
				return typeof o;
			} : function(o) {
				return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
			}, _typeof(o);
		}
		//#endregion
		//#region \0@oxc-project+runtime@0.135.0/helpers/esm/toPrimitive.js
		function toPrimitive(t, r) {
			if ("object" != _typeof(t) || !t) return t;
			var e = t[Symbol.toPrimitive];
			if (void 0 !== e) {
				var i = e.call(t, r || "default");
				if ("object" != _typeof(i)) return i;
				throw new TypeError("@@toPrimitive must return a primitive value.");
			}
			return ("string" === r ? String : Number)(t);
		}
		//#endregion
		//#region \0@oxc-project+runtime@0.135.0/helpers/esm/toPropertyKey.js
		function toPropertyKey(t) {
			var i = toPrimitive(t, "string");
			return "symbol" == _typeof(i) ? i : i + "";
		}
		//#endregion
		//#region \0@oxc-project+runtime@0.135.0/helpers/esm/defineProperty.js
		function _defineProperty(e, r, t) {
			return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
				value: t,
				enumerable: !0,
				configurable: !0,
				writable: !0
			}) : e[r] = t, e;
		}
		//#endregion
		//#region src/client/catalog.ts
		/** Loads at most one model catalog for the current Host generation. */
		var ModelCatalogDirectory = class {
			/**
			* @param ctx - the providing plugin's context, whose `remote.session`
			* namespace carries the Host-generation catalog.
			*/
			constructor(ctx) {
				this.ctx = ctx;
				_defineProperty(this, "store", (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
					value: null,
					status: "idle",
					error: null
				}));
				_defineProperty(this, "generation", 0);
				_defineProperty(this, "inflight", void 0);
			}
			/**
			* Return the current generation's catalog, sharing its one in-flight load.
			* @returns the loaded global catalog.
			*/
			load() {
				const state = this.store.getSnapshot();
				if (state.status === "ready" && state.value !== null) return Promise.resolve(state.value);
				if (this.inflight !== void 0) return this.inflight;
				const generation = this.generation;
				this.store.update((draft) => {
					draft.status = "loading";
					draft.error = null;
				});
				const operation = this.ctx.remote.session.modelCatalog().then((response) => {
					if (!response.ok) throw new Error(`${response.error.code}: ${response.error.message}`);
					if (generation === this.generation) this.store.set({
						value: response.value,
						status: "ready",
						error: null
					});
					return response.value;
				}).catch((error) => {
					if (generation === this.generation) this.store.update((draft) => {
						draft.status = "error";
						draft.error = error instanceof Error ? error.message : String(error);
					});
					throw error;
				}).finally(() => {
					if (generation === this.generation && this.inflight === operation) this.inflight = void 0;
				});
				this.inflight = operation;
				return operation;
			}
			/**
			* Invalidate the loaded catalog; the next explicit menu read reloads it.
			* @param clear - whether values from the previous Host generation must be hidden.
			*/
			invalidate(clear = false) {
				this.generation += 1;
				this.inflight = void 0;
				const value = clear ? null : this.store.getSnapshot().value;
				this.store.set({
					value,
					status: "idle",
					error: null
				});
			}
			/** Invalidate and reload the catalog after a Host-side model input changes. */
			refresh() {
				this.invalidate();
				this.load().catch(() => {});
			}
			/** Clear Host-specific values and load the replacement Host generation. */
			resetGeneration() {
				this.invalidate(true);
				this.load().catch(() => {});
			}
		};
		//#endregion
		//#region src/client/directory.ts
		/**
		* The projection face value is opaque to this package; the Host shapes it into
		* the durable model-selection fold. Absent means "this Session has not folded
		* a selection yet", which is not the same as an empty one.
		* @param value - the projection snapshot's raw value.
		* @returns the typed fold, or undefined when the Session carries none.
		*/
		function modelSelectionProjection(value) {
			return value === void 0 || value === null ? void 0 : value;
		}
		/** One session's shared directory controller; disposed with the session scope. */
		var ModelDirectory = class {
			/**
			* @param sessions - the session wire face (captured from the plugin's root connection).
			* @param sessionId - the owning session.
			* @param available - whether this session may use Agent-bound model RPCs.
			* @param catalog - Host-generation catalog shared by every Session.
			* @param projected - durable model selection projected from Session history.
			*/
			constructor(sessions, sessionId, available, catalog, projected) {
				this.sessions = sessions;
				this.sessionId = sessionId;
				this.available = available;
				this.catalog = catalog;
				this.projected = projected;
				_defineProperty(this, "store", (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
					current: null,
					routable: null,
					groups: [],
					failures: [],
					status: "idle",
					error: null
				}));
				_defineProperty(this, "generation", 0);
				_defineProperty(this, "disposed", false);
				_defineProperty(this, "resolved", false);
				_defineProperty(this, "unsubscribeCatalog", void 0);
				_defineProperty(this, "unsubscribeSelection", void 0);
				this.unsubscribeCatalog = catalog.store.subscribe(() => {
					this.syncInputs();
				});
				this.unsubscribeSelection = projected.subscribe(() => {
					this.syncInputs();
				});
				this.syncInputs();
			}
			/**
			* Ensure the Host generation's shared advisory catalog is loaded.
			* @returns the fresh directory value.
			*/
			async load() {
				this.assertAvailable();
				await this.catalog.load();
				this.syncInputs();
				return this.store.getSnapshot();
			}
			/**
			* Select the complete provider/model/reasoning selection (both entries submit through here). The durable
			* projection frame updates the shared current; failure surfaces on the store
			* and throws so each entry's own retry surface engages.
			* @param selection - provider, provider-owned model id, and optional adapter-owned effort.
			*/
			async select(selection) {
				this.assertAvailable();
				const generation = ++this.generation;
				this.store.update((s) => {
					s.status = "selecting";
					s.error = null;
				});
				const result = await this.sessions.selectModel({
					sessionId: this.sessionId,
					provider: selection.provider,
					model: selection.model,
					...selection.reasoningEffort === void 0 ? {} : { reasoningEffort: selection.reasoningEffort }
				});
				if (this.disposed || generation !== this.generation) {
					if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
					return;
				}
				if (!result.ok) {
					this.store.update((s) => {
						s.status = "error";
						s.error = `${result.error.code}: ${result.error.message}`;
					});
					throw new Error(`session.selectModel failed: ${result.error.code}: ${result.error.message}`);
				}
				this.store.update((s) => {
					s.status = "ready";
					s.error = null;
				});
				this.syncInputs();
			}
			/**
			* Invalidate an in-flight selection response from the previous Host generation.
			*/
			resetConnected() {
				if (this.disposed) return;
				++this.generation;
				this.store.update((state) => {
					if (state.status === "selecting") state.status = "idle";
					state.error = null;
				});
				this.syncInputs();
			}
			/** Scope teardown: late settlements lose write access to the store. */
			dispose() {
				this.disposed = true;
				this.unsubscribeSelection();
				this.unsubscribeCatalog();
			}
			assertAvailable() {
				if (!this.available()) throw new Error("model selection is unavailable for addressed subagent sessions");
			}
			/**
			* Project the shared catalog + this Session's durable selection onto the
			* rendered snapshot. The catalog and the projection arrive independently, so
			* this runs on either change: nothing renders until both are readable, and a
			* catalog failure after a successful resolve is surfaced without discarding
			* the last good groups.
			*/
			syncInputs() {
				if (this.disposed) return;
				const catalog = this.catalog.store.getSnapshot();
				const projected = modelSelectionProjection(this.projected.getSnapshot());
				if (catalog.status !== "ready" || catalog.value === null || projected === void 0) {
					if (this.resolved) {
						if (catalog.status === "error") this.store.update((state) => {
							state.status = "error";
							state.error = catalog.error;
						});
						return;
					}
					this.store.set({
						current: null,
						routable: null,
						groups: [],
						failures: [],
						status: catalog.status === "error" ? "error" : "loading",
						error: catalog.error
					});
					return;
				}
				const current = projected.next ?? catalog.value.default;
				this.resolved = true;
				this.store.set({
					current,
					routable: catalog.value.routableProviders.includes(current.provider),
					groups: catalog.value.groups,
					failures: catalog.value.failures,
					status: this.store.getSnapshot().status === "selecting" ? "selecting" : "ready",
					error: null
				});
			}
		};
		//#endregion
		//#region src/client/service.ts
		/**
		* ModelDirectoryResolver (`ctx.modelDirectories`): the root owner of per-session
		* {@link ModelDirectory} instances. Both selection entries (the /model popup
		* and the composer model seat) resolve their session's directory through
		* this service, which is what makes the dual entry one shared state.
		*
		* Since dsh 0.1.5 the Host-generation model catalog is owned here too (one
		* shared read for every Session), and each session directory is composed from
		* that catalog plus the session's own `modelSelection` projection.
		*
		* Per-session storage follows the client service pattern (InputTriggerService /
		* CommandUiRuntime): a lazy service-internal map whose entry is deleted by the
		* owning scope's disposer.
		*/
		/** The `ctx.modelDirectories` session model-selection service. */
		var ModelDirectoryResolver = class extends _deepseek_ai_cordis.Service {
			/**
			* @param ctx - owning root context (the service registers itself as `modelDirectories`).
			* @param config - the bound translator for this plugin's own dictionary.
			*/
			constructor(ctx, config) {
				super(ctx, "modelDirectories");
				_defineProperty(this, "live", { directories: /* @__PURE__ */ new Map() });
				_defineProperty(this, "catalog", void 0);
				_defineProperty(this, "blockReason", void 0);
				this.blockReason = config.blockReason;
				this.catalog = new ModelCatalogDirectory(ctx);
				this.catalog.load().catch(() => {});
				ctx.on("connection/reset", () => {
					this.catalog.resetGeneration();
					for (const directory of this.live.directories.values()) directory.resetConnected();
				});
				ctx.remote.$on("llm/adapters-updated", () => {
					this.catalog.refresh();
				});
				ctx.remote.$on("settings/document-updated", () => {
					this.catalog.refresh();
				});
				ctx.remote.$on("credentials/reference-updated", () => {
					this.catalog.refresh();
				});
			}
			/**
			* Resolve the per-session shared directory (lazy; the scope disposer
			* removes and disposes it). Unknown sessions fail loud.
			* @param sessionId - the owning session.
			* @returns the resident directory both entries share.
			*/
			directoryFor(sessionId) {
				const { live } = this;
				const existing = live.directories.get(sessionId);
				if (existing !== void 0) return existing;
				const sessions = this.ctx.sessions;
				const actx = sessions.scope(sessionId);
				if (actx === void 0) throw new Error(`dsh-ui-interaction: session "${String(sessionId)}" resolved no scope`);
				const binding = sessions.binding(sessionId);
				if (binding === void 0) throw new Error(`dsh-ui-interaction: session "${String(sessionId)}" resolved no binding`);
				const directory = new ModelDirectory(this.ctx.remote.session, sessionId, () => sessions.subagentAddress(sessionId) === void 0, this.catalog, binding.session.projections.faceOf("modelSelection"));
				live.directories.set(sessionId, directory);
				const conversation = this.ctx.get("conversation");
				if (conversation !== void 0) {
					const publish = () => {
						conversation.blocks.set(sessionId, directory.store.getSnapshot().routable === false ? { reason: this.blockReason() } : void 0);
					};
					publish();
					actx.effect(() => {
						const stop = directory.store.subscribe(publish);
						return () => {
							stop();
							conversation.blocks.set(sessionId, void 0);
						};
					}, "dsh-ui-interaction: composer block");
				}
				actx.effect(() => () => {
					directory.dispose();
					live.directories.delete(sessionId);
				}, "dsh-ui-interaction: session directory");
				return directory;
			}
		};
		_defineProperty(ModelDirectoryResolver, "inject", [
			"sessions",
			"remote",
			"remote.session"
		]);
		//#endregion
		//#region ../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
		function r(e) {
			var t, f, n = "";
			if ("string" == typeof e || "number" == typeof e) n += e;
			else if ("object" == typeof e) if (Array.isArray(e)) {
				var o = e.length;
				for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
			} else for (f in e) e[f] && (n && (n += " "), n += f);
			return n;
		}
		function clsx() {
			for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
			return n;
		}
		//#endregion
		//#region \0dsh-css:D:\plugin\deepseek-harness\plugins\dsh-ui-interaction\src\client\ModelSelect.module.css.mjs
		const css = ".NOMXla_root{min-width:0;position:relative}.NOMXla_trigger{min-width:0;max-width:min(360px,45cqw);height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}.NOMXla_trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.NOMXla_trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}.NOMXla_trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}.NOMXla_triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.NOMXla_triggerEffort{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-caption);flex-shrink:1000;overflow:hidden}.NOMXla_triggerIcon{flex:none;display:none}@container (width<=360px){.NOMXla_triggerIcon{display:block}.NOMXla_triggerLabel,.NOMXla_triggerEffort{display:none}}.NOMXla_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s}.NOMXla_chevronOpen{transform:rotate(180deg)}.NOMXla_menu{z-index:1100;background:var(--dsw-specific-menu);width:max-content;min-width:min(240px,100vw - 32px);max-width:min(420px,100vw - 32px);max-height:min(360px,100vh - 96px);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-primary);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border:0;border-radius:20px;flex-direction:column;padding:4px;display:flex;position:fixed;overflow:hidden}.NOMXla_status,.NOMXla_empty{color:var(--dsw-alias-label-tertiary);padding:10px;font-size:13px;line-height:20px}.NOMXla_error,.NOMXla_warning{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:8px;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;padding:7px 8px;font-size:12px;line-height:18px;display:flex}.NOMXla_warning{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-state-warn-label)}.NOMXla_retry{color:inherit;font:inherit;cursor:pointer;background:0 0;border:none;flex:none;padding:0;font-weight:600}.NOMXla_groups{min-height:0;overflow-y:auto}.NOMXla_provider{box-sizing:border-box;width:auto;min-width:100%;min-height:38px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border:none;border-radius:10px;outline:none;align-items:center;gap:8px;padding:6px 8px;font-size:14px;font-weight:500;line-height:20px;display:flex}.NOMXla_provider:hover:not(:disabled),.NOMXla_provider:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}.NOMXla_provider+.NOMXla_provider{margin-top:2px}.NOMXla_selectedProvider{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-primary)}.NOMXla_selectedProvider:hover:not(:disabled),.NOMXla_selectedProvider:focus-visible{background:var(--dsw-alias-interactive-bg-active)}.NOMXla_providerCheck{color:var(--dsw-alias-label-primary);flex:none}.NOMXla_back{width:100%;height:34px;color:var(--dsw-alias-label-tertiary);cursor:pointer;text-align:left;background:0 0;border:none;border-radius:10px;outline:none;flex:none;align-items:center;gap:4px;padding:0 8px;font-size:13px;line-height:20px;display:flex}.NOMXla_back:hover,.NOMXla_back:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}.NOMXla_backChevron{color:inherit;flex:none}.NOMXla_option{box-sizing:border-box;width:auto;min-width:100%;min-height:38px;color:inherit;text-align:left;cursor:pointer;background:0 0;border:none;border-radius:10px;outline:none;align-items:center;gap:8px;padding:6px 8px;display:flex}.NOMXla_option:hover:not(:disabled),.NOMXla_option:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}.NOMXla_selected{background:0 0}.NOMXla_option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}.NOMXla_optionCopy{flex-direction:column;flex:1;min-width:0;display:flex}.NOMXla_modelName{color:inherit;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:20px;overflow:hidden}.NOMXla_description{max-width:300px;color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}.NOMXla_check{color:var(--dsw-alias-label-primary);flex:0 0 18px;place-items:center;display:grid}.NOMXla_cell{box-sizing:border-box;width:auto;min-width:100%;height:40px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border:none;border-radius:10px;align-items:center;gap:8px;padding:0 10px;font-size:14px;line-height:22px;display:flex}.NOMXla_cell:hover{background:var(--dsw-alias-interactive-bg-hover)}.NOMXla_cellLabel{text-overflow:ellipsis;white-space:nowrap;flex:auto;min-width:0;overflow:hidden}.NOMXla_cell .NOMXla_cellLabel{flex:none}.NOMXla_cellValue{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-tertiary);flex:0 auto;overflow:hidden}.NOMXla_cell .NOMXla_cellValue{text-align:right;flex:auto}.NOMXla_cellChevron{color:var(--dsw-alias-label-tertiary);flex:none}";
		const tagId = "dsh-ui-interaction/ModelSelect.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-ui-interaction";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ModelSelect_module_css_default = {
			"empty": "NOMXla_empty",
			"optionCopy": "NOMXla_optionCopy",
			"modelName": "NOMXla_modelName",
			"chevronOpen": "NOMXla_chevronOpen",
			"triggerLabel": "NOMXla_triggerLabel",
			"root": "NOMXla_root",
			"cellChevron": "NOMXla_cellChevron",
			"trigger": "NOMXla_trigger",
			"provider": "NOMXla_provider",
			"triggerIcon": "NOMXla_triggerIcon",
			"cellLabel": "NOMXla_cellLabel",
			"selected": "NOMXla_selected",
			"error": "NOMXla_error",
			"cell": "NOMXla_cell",
			"providerCheck": "NOMXla_providerCheck",
			"chevron": "NOMXla_chevron",
			"triggerEffort": "NOMXla_triggerEffort",
			"warning": "NOMXla_warning",
			"description": "NOMXla_description",
			"menu": "NOMXla_menu",
			"status": "NOMXla_status",
			"selectedProvider": "NOMXla_selectedProvider",
			"groups": "NOMXla_groups",
			"back": "NOMXla_back",
			"retry": "NOMXla_retry",
			"check": "NOMXla_check",
			"option": "NOMXla_option",
			"cellValue": "NOMXla_cellValue",
			"backChevron": "NOMXla_backChevron"
		};
		//#endregion
		//#region src/client/ModelSelect.tsx
		/**
		* ModelSelect: the composer's named model seat (`conversation.input.model`).
		* Two-level selection: the root menu is the Model / Effort row pair (label +
		* current value + a right chevron). Model drills twice — providers first,
		* then the chosen provider's models — over the shared directory; effort
		* drills into the selected model's levels. The trigger shows both: model
		* name + effort in the caption tone.
		* Data and submission ride the SAME per-session ModelDirectory as the
		* /model popup; exact-model reasoning metadata and the selected effort come
		* from the Host rather than a client-owned vocabulary. A rejected selection
		* announces through the shared transient Toast anchored to the composer
		* card; the in-menu strip with Retry remains the catalog-load surface.
		*
		* The menu is portaled to `document.body` at a fixed, viewport-clamped
		* position (measured through a hidden first pass), because the composer rail
		* can scroll and clip an absolutely positioned popup. Only the trigger stays
		* in the seat's own layout, so the trigger is what the seat's width drives:
		* in a narrow rail the label collapses into a leading icon.
		*/
		/** Unplaced portal card: hidden but laid out at a fixed origin so offsetWidth/offsetHeight are real (the menu's measure pass). */
		const MEASURE_STYLE = {
			visibility: "hidden",
			left: 0,
			top: 0
		};
		/** Closest the placed menu may sit to any viewport edge. */
		const MENU_MARGIN = 12;
		/**
		* Render the composer model seat.
		* @param props - owner share (locked) + injected face (shared directory
		* store/verbs) + the standard locale seat.
		* @returns the trigger and, while open, the two-level menu.
		*/
		function ModelSelect({ locked, available, directory, load, select, t }) {
			const state = (0, react.useSyncExternalStore)((fn) => directory.subscribe(fn), () => directory.getSnapshot());
			const [open, setOpen] = (0, react.useState)(false);
			const [pane, setPane] = (0, react.useState)("root");
			const [activeGroupId, setActiveGroupId] = (0, react.useState)(null);
			const lastActionRef = (0, react.useRef)("load");
			const [toast, setToast] = (0, react.useState)(null);
			const toastSeq = (0, react.useRef)(0);
			const rootRef = (0, react.useRef)(null);
			const triggerRef = (0, react.useRef)(null);
			const menuRef = (0, react.useRef)(null);
			const [menuPos, setMenuPos] = (0, react.useState)(null);
			const itemRefs = (0, react.useRef)([]);
			const id = (0, react.useId)();
			const choices = (0, react.useMemo)(() => state.groups.flatMap((group) => group.models.map((model) => ({
				group,
				model,
				selection: {
					provider: group.id,
					model: model.id,
					...model.reasoning?.defaultEffort === void 0 ? {} : { reasoningEffort: model.reasoning.defaultEffort }
				}
			}))), [state.groups]);
			const currentChoice = choices[state.current === null ? -1 : choices.findIndex((c) => c.selection.provider === state.current?.provider && c.selection.model === state.current.model)];
			const reasoning = currentChoice?.model.reasoning;
			const effectiveEffort = state.current?.reasoningEffort ?? reasoning?.defaultEffort;
			const effortLabel = reasoning === void 0 ? void 0 : effectiveEffort === void 0 ? t("effort.providerDefault") : reasoning.efforts.find((level) => level.id === effectiveEffort)?.name ?? effectiveEffort;
			const effortChoices = (0, react.useMemo)(() => reasoning === void 0 ? [] : [...reasoning.defaultEffort === void 0 ? [{
				key: "provider-default",
				effort: void 0,
				label: t("effort.providerDefault")
			}] : [], ...reasoning.efforts.map((effort) => ({
				key: `effort:${effort.id}`,
				effort: effort.id,
				label: effort.name,
				...effort.description === void 0 ? {} : { description: effort.description }
			}))], [reasoning, t]);
			const busy = state.status === "selecting";
			const reload = () => {
				lastActionRef.current = "load";
				load();
			};
			(0, react.useEffect)(() => {
				if (!open) return;
				const closeOutside = (event) => {
					if (rootRef.current?.contains(event.target) === true) return;
					if (menuRef.current?.contains(event.target) === true) return;
					setOpen(false);
				};
				document.addEventListener("mousedown", closeOutside);
				return () => {
					document.removeEventListener("mousedown", closeOutside);
				};
			}, [open]);
			(0, react.useLayoutEffect)(() => {
				if (!open) {
					setMenuPos(null);
					return;
				}
				const place = () => {
					const rect = triggerRef.current?.getBoundingClientRect();
					if (rect === void 0) return;
					const width = menuRef.current?.offsetWidth ?? 0;
					const height = menuRef.current?.offsetHeight ?? 0;
					let x = rect.right - width;
					let y = rect.top - 8 - height;
					if (width > 0) x = Math.min(Math.max(x, MENU_MARGIN), window.innerWidth - width - MENU_MARGIN);
					if (height > 0) y = Math.min(Math.max(y, MENU_MARGIN), window.innerHeight - height - MENU_MARGIN);
					setMenuPos({
						left: x,
						top: y
					});
				};
				place();
				window.addEventListener("scroll", place, true);
				window.addEventListener("resize", place);
				return () => {
					window.removeEventListener("scroll", place, true);
					window.removeEventListener("resize", place);
				};
			}, [
				open,
				pane,
				state
			]);
			if (!available) return null;
			const show = () => {
				setPane("root");
				setActiveGroupId(null);
				setOpen(true);
				reload();
			};
			const close = (restoreFocus = false) => {
				setOpen(false);
				setPane("root");
				setActiveGroupId(null);
				if (restoreFocus) queueMicrotask(() => {
					triggerRef.current?.focus();
				});
			};
			const moveFocus = (offset) => {
				const items = itemRefs.current.filter((item) => item !== null);
				if (items.length === 0) return;
				const active = items.findIndex((item) => item === document.activeElement);
				items[(Math.max(active, 0) + offset + items.length) % items.length]?.focus();
			};
			const onRootKeyDown = (event) => {
				if (event.key === "Escape" && open) {
					event.preventDefault();
					if (pane === "models") setPane("providers");
					else if (pane !== "root") setPane("root");
					else close(true);
					return;
				}
				if (!open) return;
				if (event.key === "ArrowDown" || event.key === "ArrowUp") {
					event.preventDefault();
					moveFocus(event.key === "ArrowDown" ? 1 : -1);
				}
			};
			const onBlur = (event) => {
				if (event.relatedTarget instanceof Node) {
					if (rootRef.current?.contains(event.relatedTarget) === true) return;
					if (menuRef.current?.contains(event.relatedTarget) === true) return;
				}
				close();
			};
			const settleSelection = (accepted) => {
				if (accepted) {
					if (rootRef.current !== null) close(true);
					return;
				}
				const message = directory.getSnapshot().error;
				if (message !== null) {
					toastSeq.current += 1;
					setToast({
						seq: toastSeq.current,
						text: t("error.action", { message })
					});
				}
			};
			const choose = (selection) => {
				if (state.current?.provider === selection.provider && state.current.model === selection.model) {
					close(true);
					return;
				}
				lastActionRef.current = "select";
				select(selection).then(settleSelection);
			};
			const chooseEffort = (effort) => {
				if (state.current === null) return;
				if (effectiveEffort === effort) {
					close(true);
					return;
				}
				const selection = {
					provider: state.current.provider,
					model: state.current.model,
					...effort === void 0 ? {} : { reasoningEffort: effort }
				};
				lastActionRef.current = "select";
				select(selection).then(settleSelection);
			};
			const waiting = state.current === null && state.status === "loading";
			const modelLabel = waiting ? t("trigger.loading") : currentChoice?.model.name ?? (state.current === null ? t("trigger.fallback") : `${state.current.provider}/${state.current.model}`);
			const triggerLabel = effortLabel === void 0 ? modelLabel : `${modelLabel} · ${effortLabel}`;
			const triggerAria = waiting ? t("trigger.loading") : state.current === null ? t("trigger.selectAria") : effortLabel === void 0 ? t("trigger.aria", { model: modelLabel }) : t("trigger.ariaEffort", {
				model: modelLabel,
				effort: effortLabel
			});
			const activeGroup = activeGroupId === null ? void 0 : state.groups.find((group) => group.id === activeGroupId);
			const openProviderList = () => {
				setActiveGroupId(null);
				setPane("providers");
			};
			const openModels = (groupId) => {
				setActiveGroupId(groupId);
				setPane("models");
			};
			itemRefs.current = [];
			let itemIndex = 0;
			const itemRef = () => {
				const at = itemIndex++;
				return (node) => {
					itemRefs.current[at] = node;
				};
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: ModelSelect_module_css_default.root,
				onKeyDown: onRootKeyDown,
				onBlur,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						ref: triggerRef,
						type: "button",
						className: ModelSelect_module_css_default.trigger,
						"aria-label": triggerAria,
						"aria-haspopup": "menu",
						"aria-expanded": open,
						"aria-controls": open ? `${id}-menu` : void 0,
						title: triggerLabel,
						disabled: locked,
						onClick: () => {
							if (open) close();
							else show();
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutline16, {
								className: ModelSelect_module_css_default.triggerIcon,
								size: 16
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: ModelSelect_module_css_default.triggerLabel,
								children: modelLabel
							}),
							effortLabel !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: ModelSelect_module_css_default.triggerEffort,
								children: effortLabel
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: clsx(ModelSelect_module_css_default.chevron, open && ModelSelect_module_css_default.chevronOpen) })
						]
					}),
					open && (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						ref: menuRef,
						id: `${id}-menu`,
						className: ModelSelect_module_css_default.menu,
						style: menuPos ?? MEASURE_STYLE,
						role: "menu",
						"aria-label": t("menu.aria"),
						"aria-busy": state.status === "loading" || busy,
						onKeyDown: onRootKeyDown,
						onBlur,
						children: [
							pane === "root" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								ref: itemRef(),
								type: "button",
								role: "menuitem",
								className: ModelSelect_module_css_default.cell,
								onClick: openProviderList,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.cellLabel,
										children: t("menu.model")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.cellValue,
										children: modelLabel
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, { className: ModelSelect_module_css_default.cellChevron })
								]
							}), reasoning !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								ref: itemRef(),
								type: "button",
								role: "menuitem",
								className: ModelSelect_module_css_default.cell,
								onClick: () => {
									setPane("effort");
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.cellLabel,
										children: t("menu.effort")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.cellValue,
										children: effortLabel
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, { className: ModelSelect_module_css_default.cellChevron })
								]
							})] }),
							pane === "providers" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								state.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: ModelSelect_module_css_default.status,
									children: t("status.loading")
								}),
								state.error !== null && lastActionRef.current === "load" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: ModelSelect_module_css_default.error,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("error.action", { message: state.error }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ModelSelect_module_css_default.retry,
										onClick: reload,
										children: t("action.reload")
									})]
								}),
								state.failures.map((failure) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: ModelSelect_module_css_default.warning,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("warning.groupLoad", {
										name: failure.name,
										message: failure.message
									}) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ModelSelect_module_css_default.retry,
										onClick: reload,
										children: t("action.reload")
									})]
								}, failure.id)),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: clsx(ModelSelect_module_css_default.groups, "scrollable"),
									children: state.groups.map((group) => {
										const selected = state.current?.provider === group.id;
										return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											ref: itemRef(),
											type: "button",
											role: "menuitemradio",
											"aria-checked": selected,
											className: clsx(ModelSelect_module_css_default.provider, selected && ModelSelect_module_css_default.selectedProvider),
											title: group.name,
											onClick: () => {
												openModels(group.id);
											},
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: ModelSelect_module_css_default.cellLabel,
													children: group.name
												}),
												selected && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, { className: ModelSelect_module_css_default.providerCheck }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, { className: ModelSelect_module_css_default.cellChevron })
											]
										}, group.id);
									})
								}),
								state.status === "ready" && state.groups.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: ModelSelect_module_css_default.empty,
									children: t("empty.providers")
								})
							] }),
							pane === "models" && activeGroup !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									ref: itemRef(),
									type: "button",
									role: "menuitem",
									className: ModelSelect_module_css_default.back,
									onClick: openProviderList,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutline14, { className: ModelSelect_module_css_default.backChevron }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.cellLabel,
										children: activeGroup.name
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: clsx(ModelSelect_module_css_default.groups, "scrollable"),
									children: activeGroup.models.map((model) => {
										const selected = state.current?.provider === activeGroup.id && state.current.model === model.id;
										const description = descriptionOf(activeGroup.id, model, t);
										return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											ref: itemRef(),
											type: "button",
											role: "menuitemradio",
											"aria-checked": selected,
											className: clsx(ModelSelect_module_css_default.option, selected && ModelSelect_module_css_default.selected),
											title: model.name,
											disabled: busy,
											onClick: () => {
												choose({
													provider: activeGroup.id,
													model: model.id
												});
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: ModelSelect_module_css_default.optionCopy,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: ModelSelect_module_css_default.modelName,
													children: model.name
												}), description !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: ModelSelect_module_css_default.description,
													children: description
												})]
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: ModelSelect_module_css_default.check,
												children: selected ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, {}) : null
											})]
										}, model.id);
									})
								}),
								activeGroup.models.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: ModelSelect_module_css_default.empty,
									children: t("empty.models")
								})
							] }),
							pane === "effort" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [state.error !== null && lastActionRef.current === "load" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: ModelSelect_module_css_default.error,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("error.action", { message: state.error }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: ModelSelect_module_css_default.retry,
									onClick: reload,
									children: t("action.reload")
								})]
							}), effortChoices.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: ModelSelect_module_css_default.empty,
								children: t("empty.efforts")
							}) : effortChoices.map((level) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								ref: itemRef(),
								type: "button",
								role: "menuitemradio",
								"aria-checked": effectiveEffort === level.effort,
								className: clsx(ModelSelect_module_css_default.option, effectiveEffort === level.effort && ModelSelect_module_css_default.selected),
								disabled: busy,
								onClick: () => {
									chooseEffort(level.effort);
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: ModelSelect_module_css_default.optionCopy,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.modelName,
										children: level.label
									}), level.description !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: ModelSelect_module_css_default.description,
										children: level.description
									})]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: ModelSelect_module_css_default.check,
									children: effectiveEffort === level.effort ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, {}) : null
								})]
							}, level.key))] })
						]
					}), document.body),
					toast !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
						text: toast.text,
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, {}),
						anchor: rootRef.current?.closest("[data-composer-card]") ?? null,
						onDone: () => {
							setToast(null);
						}
					}, toast.seq)
				]
			});
		}
		//#endregion
		//#region src/client/neon-glow.ts
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
		const PLUGIN_ID$1 = "dsh-ui-interaction";
		/** id stamped onto the injected <style> so the loader can find plugin-owned css. */
		const STYLE_ID$1 = `${PLUGIN_ID$1}/neon-glow`;
		/** id of the fixed backdrop layer. */
		const GLOW_ID = `${PLUGIN_ID$1}-neon-glow`;
		/**
		* Global stylesheet for the neon-glow layer. `.dsh-neon-glow-backdrop` is the
		* fixed full-viewport layer; each `.dsh-neon-glow-blob` is one blurred color
		* pool whose layout and light/dark colors are set inline from the BLOBS data.
		* Theme and strength are keyed off the body dark-theme flag, so a theme flip
		* re-palettes the glow without JS.
		*/
		const GLOBAL_CSS$1 = `
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
   data-chat-flow-kind="user" is the stable owner hook (0.1.5 replaced the old
   data-time-hover-root row attribute with data-actions-reveal, which only marks
   the assistant turn tail); the :not() keeps the pending steering projection
   out by refusing any bubble rendered inside a pending-steering row. */
[data-chat-flow-kind="user"] [class$="_bubble"]:not([data-pending-steering] *) {
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
/* The markdown content root carries no stable attribute, so it is matched by
   the local-name segment of its hashed CSS Module class ("<hash>_markdown_<n>",
   which lightningcss derives from the local name). The hash itself is never
   named, and the selector stays valid across builds. The file-type classes of
   the same local name sit on icon elements, so the content root is pinned to a
   DIV and scoped to the chat content area. */
/* Dark theme: that root drops its label-primary body color to label-secondary
   so the assistant prose reads one step quieter against the deeper neon
   backdrop. */
body[data-ds-dark-theme] [data-chat-flow] div[class*="_markdown_"] {
  color: var(--dsw-alias-label-secondary);
}
/* Light theme: inline code (the .markdown :not(pre) > code chips, scoped to
   the markdown content root) drops its background to a pure neutral white so
   the chips read flat against the pale neon backdrop instead of tinting. */
body:not([data-ds-dark-theme]) [data-chat-flow] [class*="_markdown_"] :not(pre) > code {
  background-color: var(--dsw-static-neutral-bluish-00);
}
/* Tighten the markdown h2 margins (32px above 16px below becomes 16px above
   16px below) so section headings sit closer to the surrounding prose. */
[data-chat-flow] [class*="_markdown_"] h2 {
  margin: 16px 0 16px;
}
/* Honor reduced-motion: keep the ambient color but drop the drift. */
@media (prefers-reduced-motion: reduce) {
  .dsh-neon-glow-blob {
    animation: none !important;
  }
}
`;
		/** Five pools in two colors (purple, blue) at mixed sizes, spread around the
		viewport — the light/dark theme colors ride --glow-light/--glow-dark. */
		const BLOBS = [
			{
				style: {
					top: "-18%",
					left: "-15%",
					width: "56vw",
					height: "56vw"
				},
				light: "#b8adf9",
				dark: "#8b5cf6"
			},
			{
				style: {
					top: "-10%",
					right: "-14%",
					width: "42vw",
					height: "42vw"
				},
				light: "#38bdf8",
				dark: "#2563eb"
			},
			{
				style: {
					bottom: "-16%",
					left: "18%",
					width: "44vw",
					height: "44vw"
				},
				light: "#b8adf9",
				dark: "#8b5cf6"
			},
			{
				style: {
					bottom: "-8%",
					right: "-6%",
					width: "30vw",
					height: "30vw"
				},
				light: "#38bdf8",
				dark: "#2563eb"
			},
			{
				style: {
					bottom: "-4%",
					left: "-8%",
					width: "24vw",
					height: "24vw"
				},
				light: "#b8adf9",
				dark: "#8b5cf6"
			}
		];
		/**
		* Mount the neon-glow ambient background into the document body.
		* @returns a disposer that tears the layer and its stylesheet down.
		*/
		function applyNeonGlow() {
			const style = document.createElement("style");
			style.dataset.plugin = PLUGIN_ID$1;
			style.dataset.pluginCss = STYLE_ID$1;
			style.textContent = GLOBAL_CSS$1;
			const glow = document.createElement("div");
			glow.id = GLOW_ID;
			glow.className = "dsh-neon-glow-backdrop";
			glow.setAttribute("aria-hidden", "true");
			for (const blob of BLOBS) {
				const el = document.createElement("div");
				el.className = "dsh-neon-glow-blob";
				for (const [key, value] of Object.entries(blob.style)) {
					if (value === void 0) continue;
					el.style.setProperty(key, value);
				}
				el.style.setProperty("--glow-light", blob.light);
				el.style.setProperty("--glow-dark", blob.dark);
				glow.append(el);
			}
			document.head.append(style);
			document.body.prepend(glow);
			return () => {
				glow.remove();
				style.remove();
			};
		}
		//#endregion
		//#region src/client/branding.ts
		/**
		* Branding retouch for the neon-chrome profile: drop the DeepSeek whale/fish
		* logo marks. Pure CSS so it survives React reconciliation — the svgs are
		* hidden, not deleted, because deleting them lets React re-create them.
		*
		* Targets ride stable DOM signatures, never the full hashed class prefix:
		*  - the BrandWordmark svg (`viewBox="0 0 182 24"`) is hidden;
		*  - the FishLogo svg (`viewBox="0 0 23.16 17.04"` — collapsed-sidebar rail
		*    and New Session hero headline) is hidden.
		*
		* No data, no slots, nothing model-visible.
		*/
		/** The plugin's own element namespace, matching the other surfaces. */
		const PLUGIN_ID = "dsh-ui-interaction";
		/** id stamped onto the injected <style> so the loader can find plugin-owned css. */
		const STYLE_ID = `${PLUGIN_ID}/branding`;
		/**
		* Global stylesheet for the branding retouch: hide the whale and fish logo
		* svgs by their stable viewBox.
		*/
		const GLOBAL_CSS = `
svg[viewBox="0 0 182 24"] {
  display: none;
}
svg[viewBox="0 0 23.16 17.04"] {
  display: none;
}
`;
		/**
		* Mount the branding retouch by injecting its stylesheet.
		* @returns a disposer that removes the stylesheet.
		*/
		function applyDshBranding() {
			const style = document.createElement("style");
			style.dataset.plugin = PLUGIN_ID;
			style.dataset.pluginCss = STYLE_ID;
			style.textContent = GLOBAL_CSS;
			document.head.append(style);
			return () => {
				style.remove();
			};
		}
		//#endregion
		//#region src/client/index.ts
		/** Flatten the directory into popup rows; failure rows are listed for visibility but never selectable. */
		function optionsOf(directory, t) {
			const rows = [];
			for (const group of directory.groups) for (const model of group.models) {
				const description = descriptionOf(group.id, model, t);
				rows.push({
					id: rowId(group.id, model.id),
					label: model.name,
					detail: description !== void 0 ? `${group.name} · ${description}` : group.name,
					...directory.current !== null && directory.current.provider === group.id && directory.current.model === model.id ? { active: true } : {}
				});
			}
			for (const failure of directory.failures) rows.push({
				id: `failure/${failure.id}`,
				label: failure.name,
				detail: t("option.loadError", { message: failure.message })
			});
			return rows;
		}
		/**
		* Resolve a picked row back to its model selection by matching against the loaded
		* groups (the same data the rows were built from — ids stay opaque).
		* @param state - the session's directory snapshot.
		* @param id - the picked row id.
		* @returns the row's model selection, or undefined for failure rows / stale ids.
		*/
		function selectionOf(state, id) {
			for (const group of state.groups) for (const model of group.models) {
				if (rowId(group.id, model.id) !== id) continue;
				const reasoningEffort = state.current?.provider === group.id && state.current.model === model.id ? state.current?.reasoningEffort ?? model.reasoning?.defaultEffort : model.reasoning?.defaultEffort;
				return {
					provider: group.id,
					model: model.id,
					...reasoningEffort === void 0 ? {} : { reasoningEffort }
				};
			}
		}
		/** Dictionary namespace owned by this plugin. */
		const NS = "model";
		/** Required services: the contribution registry, the seat's slot registry, locale, and the service's own faces. */
		const inject = [
			"commandUi",
			"locale",
			"sessions",
			"slots",
			"remote",
			"remote.session"
		];
		/**
		* Client plugin body: mount ModelDirectoryResolver, register the `model`
		* dictionaries, then register the /model popup contribution and the composer
		* model seat over the service.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => applyNeonGlow(), "dsh-ui-interaction: neon-glow background");
			ctx.effect(() => applyDshBranding(), "dsh-ui-interaction: brand retouch");
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-ui-interaction: dictionaries");
			const t = ctx.locale.bind(NS);
			ctx.plugin(ModelDirectoryResolver, { blockReason: () => t("blocked.composer") });
			ctx.inject(["commandUi", "modelDirectories"], (scope) => {
				const command = scope.get("commandUi");
				const models = scope.modelDirectories;
				const sessions = scope.sessions;
				scope.effect(() => command.register({
					name: "model",
					description: () => t("command.description"),
					available: (session) => sessions.subagentAddress(session.sessionId) === void 0,
					ui: {
						kind: "popupSelect",
						options: async (session) => {
							if (sessions.subagentAddress(session.sessionId) !== void 0) throw new Error("model selection is unavailable for addressed subagent sessions");
							return optionsOf(await models.directoryFor(session.sessionId).load(), t);
						},
						onSelect: async (option, session) => {
							if (sessions.subagentAddress(session.sessionId) !== void 0) throw new Error("model selection is unavailable for addressed subagent sessions");
							const directory = models.directoryFor(session.sessionId);
							const selection = selectionOf(directory.store.getSnapshot(), option.id);
							if (selection === void 0) throw new Error("this provider's catalog failed to load — pick a model from a loaded group");
							await directory.select(selection);
						}
					}
				}), "dsh-ui-interaction: /model contribution");
			});
			ctx.inject(["slots", "modelDirectories"], (scope) => {
				const models = scope.modelDirectories;
				const sessions = scope.sessions;
				scope.slots.inject("conversation.input.model", () => scope.slots.register({
					name: "conversation.input.model",
					locale: NS,
					inject: (sessionId) => {
						const directory = models.directoryFor(sessionId);
						const available = sessions.subagentAddress(sessionId) === void 0;
						return {
							available,
							directory: directory.store,
							load: () => {
								if (available) directory.load().catch(() => {});
							},
							select: (selection) => available ? directory.select(selection).then(() => true, () => false) : Promise.resolve(false)
						};
					}
				}, ModelSelect));
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map