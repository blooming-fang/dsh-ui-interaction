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
		// src/client/locales.ts
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
		// src/client/describe.ts
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
		// \0@oxc-project+runtime@0.156.0/helpers/esm/typeof.js
		function _typeof(o) {
			"@babel/helpers - typeof";
			return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
				return typeof o;
			} : function(o) {
				return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
			}, _typeof(o);
		}
		// \0@oxc-project+runtime@0.156.0/helpers/esm/toPrimitive.js
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
		// \0@oxc-project+runtime@0.156.0/helpers/esm/toPropertyKey.js
		function toPropertyKey(t) {
			var i = toPrimitive(t, "string");
			return "symbol" == _typeof(i) ? i : i + "";
		}
		// \0@oxc-project+runtime@0.156.0/helpers/esm/defineProperty.js
		function _defineProperty(e, r, t) {
			return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
				value: t,
				enumerable: !0,
				configurable: !0,
				writable: !0
			}) : e[r] = t, e;
		}
		// src/client/catalog.ts
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
		// src/client/directory.ts
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
		// src/client/service.ts
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
		// node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
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
		// \0dsh-css:D:\plugin\deepseek-harness\plugins\dsh-ui-interaction\src\client\ModelSelect.module.css.mjs
		const css = ".NOMXla_root{min-width:0;position:relative}.NOMXla_trigger{min-width:0;max-width:min(360px,45cqw);height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}.NOMXla_trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.NOMXla_trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}.NOMXla_trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}.NOMXla_triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.NOMXla_triggerEffort{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-caption);flex-shrink:1000;overflow:hidden}.NOMXla_triggerIcon{flex:none;display:none}@container (width<=360px){.NOMXla_triggerIcon{display:block}.NOMXla_triggerLabel,.NOMXla_triggerEffort{display:none}}.NOMXla_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s}.NOMXla_chevronOpen{transform:rotate(180deg)}.NOMXla_menu{z-index:1100;background-color:var(--dsw-alias-bg-layer-2);background-image:linear-gradient(var(--dsw-specific-menu), var(--dsw-specific-menu));width:max-content;min-width:min(240px,100vw - 32px);max-width:min(420px,100vw - 32px);max-height:min(360px,100vh - 96px);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-primary);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border:0;border-radius:20px;flex-direction:column;padding:4px;display:flex;position:fixed;overflow:hidden}.NOMXla_status,.NOMXla_empty{color:var(--dsw-alias-label-tertiary);padding:10px;font-size:13px;line-height:20px}.NOMXla_error,.NOMXla_warning{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:8px;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;padding:7px 8px;font-size:12px;line-height:18px;display:flex}.NOMXla_warning{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-state-warn-label)}.NOMXla_retry{color:inherit;font:inherit;cursor:pointer;background:0 0;border:none;flex:none;padding:0;font-weight:600}.NOMXla_groups{min-height:0;overflow-y:auto}.NOMXla_provider{box-sizing:border-box;width:auto;min-width:100%;min-height:38px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border:none;border-radius:10px;outline:none;align-items:center;gap:8px;padding:6px 8px;font-size:14px;font-weight:500;line-height:20px;display:flex}.NOMXla_provider:hover:not(:disabled),.NOMXla_provider:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}.NOMXla_provider+.NOMXla_provider{margin-top:2px}.NOMXla_selectedProvider{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-primary)}.NOMXla_selectedProvider:hover:not(:disabled),.NOMXla_selectedProvider:focus-visible{background:var(--dsw-alias-interactive-bg-active)}.NOMXla_providerCheck{color:var(--dsw-alias-label-primary);flex:none}.NOMXla_back{width:100%;height:34px;color:var(--dsw-alias-label-tertiary);cursor:pointer;text-align:left;background:0 0;border:none;border-radius:10px;outline:none;flex:none;align-items:center;gap:4px;padding:0 8px;font-size:13px;line-height:20px;display:flex}.NOMXla_back:hover,.NOMXla_back:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}.NOMXla_backChevron{color:inherit;flex:none}.NOMXla_option{box-sizing:border-box;width:auto;min-width:100%;min-height:38px;color:inherit;text-align:left;cursor:pointer;background:0 0;border:none;border-radius:10px;outline:none;align-items:center;gap:8px;padding:6px 8px;display:flex}.NOMXla_option:hover:not(:disabled),.NOMXla_option:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}.NOMXla_selected{background:0 0}.NOMXla_option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}.NOMXla_optionCopy{flex-direction:column;flex:1;min-width:0;display:flex}.NOMXla_modelName{color:inherit;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:20px;overflow:hidden}.NOMXla_description{max-width:300px;color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}.NOMXla_check{color:var(--dsw-alias-label-primary);flex:0 0 18px;place-items:center;display:grid}.NOMXla_cell{box-sizing:border-box;width:auto;min-width:100%;height:40px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border:none;border-radius:10px;align-items:center;gap:8px;padding:0 10px;font-size:14px;line-height:22px;display:flex}.NOMXla_cell:hover{background:var(--dsw-alias-interactive-bg-hover)}.NOMXla_cellLabel{text-overflow:ellipsis;white-space:nowrap;flex:auto;min-width:0;overflow:hidden}.NOMXla_cell .NOMXla_cellLabel{flex:none}.NOMXla_cellValue{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-tertiary);flex:0 auto;overflow:hidden}.NOMXla_cell .NOMXla_cellValue{text-align:right;flex:auto}.NOMXla_cellChevron{color:var(--dsw-alias-label-tertiary);flex:none}";
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
			"chevronOpen": "NOMXla_chevronOpen",
			"optionCopy": "NOMXla_optionCopy",
			"selected": "NOMXla_selected",
			"error": "NOMXla_error",
			"cellChevron": "NOMXla_cellChevron",
			"root": "NOMXla_root",
			"cellLabel": "NOMXla_cellLabel",
			"provider": "NOMXla_provider",
			"retry": "NOMXla_retry",
			"description": "NOMXla_description",
			"trigger": "NOMXla_trigger",
			"triggerEffort": "NOMXla_triggerEffort",
			"option": "NOMXla_option",
			"menu": "NOMXla_menu",
			"selectedProvider": "NOMXla_selectedProvider",
			"triggerLabel": "NOMXla_triggerLabel",
			"cellValue": "NOMXla_cellValue",
			"check": "NOMXla_check",
			"groups": "NOMXla_groups",
			"back": "NOMXla_back",
			"cell": "NOMXla_cell",
			"status": "NOMXla_status",
			"providerCheck": "NOMXla_providerCheck",
			"warning": "NOMXla_warning",
			"chevron": "NOMXla_chevron",
			"modelName": "NOMXla_modelName",
			"backChevron": "NOMXla_backChevron",
			"triggerIcon": "NOMXla_triggerIcon"
		};
		// src/client/ModelSelect.tsx
		/**
		* ModelSelect: the composer's named model seat (`conversation.input.model`).
		* Two-level selection: the root menu is the Model / Effort row pair (label +
		* current value + a right chevron). Model drills twice 鈥?providers first,
		* then the chosen provider's models 鈥?over the shared directory; effort
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
			const triggerLabel = effortLabel === void 0 ? modelLabel : `${modelLabel} 路 ${effortLabel}`;
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
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutlineRegular, { className: ModelSelect_module_css_default.triggerIcon }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: ModelSelect_module_css_default.triggerLabel,
								children: modelLabel
							}),
							effortLabel !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: ModelSelect_module_css_default.triggerEffort,
								children: effortLabel
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { className: clsx(ModelSelect_module_css_default.chevron, open && ModelSelect_module_css_default.chevronOpen) })
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
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { className: ModelSelect_module_css_default.cellChevron })
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
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { className: ModelSelect_module_css_default.cellChevron })
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
												selected && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { className: ModelSelect_module_css_default.providerCheck }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { className: ModelSelect_module_css_default.cellChevron })
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
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutlineRegular, { className: ModelSelect_module_css_default.backChevron }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
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
												children: selected ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, {}) : null
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
									children: effectiveEffort === level.effort ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, {}) : null
								})]
							}, level.key))] })
						]
					}), document.body),
					toast !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
						text: toast.text,
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
						anchor: rootRef.current?.closest("[data-composer-card]") ?? null,
						onDone: () => {
							setToast(null);
						}
					}, toast.seq)
				]
			});
		}
		// src/client/theme.ts
		/** Style-tag namespace shared with the plugin's other chrome modules. */
		const PLUGIN_ID$4 = "dsh-ui-interaction";
		/** Layer identity handed to the theme service — one override layer per source. */
		const THEME_SOURCE = PLUGIN_ID$4;
		/** id stamped onto the injected <style> so the loader can find plugin-owned css. */
		const STYLE_ID$4 = PLUGIN_ID$4 + "/theme";
		/**
		* Light-theme palette — the design system's warm paper surfaces. The ink /
		* body / muted ladder is the text scale; surface-soft and surface-card are the
		* two cream steps everything raised sits on; primary is the coral accent with
		* its active and disabled partners.
		*/
		const L = {
			primary: "#cc785c",
			primaryActive: "#a9583e",
			primaryDisabled: "#e3dacb",
			ink: "#141413",
			body: "#3d3d3a",
			bodyStrong: "#252523",
			muted: "#6c6a64",
			mutedSoft: "#857f74",
			hairline: "#dfd5c5",
			hairlineSoft: "#e6ddcd",
			canvas: "#f5f0e4",
			surfaceSoft: "#efe9db",
			surfaceCard: "#e9e1d1",
			surfaceCreamStrong: "#e1d7c4",
			onPrimary: "#ffffff",
			onDark: "#faf9f5",
			onDarkSoft: "#a09d96",
			accentTeal: "#5db8a6",
			accentAmber: "#e8a55a",
			success: "#5db872",
			warning: "#d4a017",
			error: "#c64545"
		};
		/**
		* Dark-theme palette — the design system's warm charcoal surfaces. The accent
		* stays coral (it reads at 5.5:1 on the charcoal canvas); the muted text step
		* is lifted so the same ladder keeps its contrast; the coral-light tone covers
		* accents that need to sit `on` the dark canvas rather than on a fill.
		*/
		const D = {
			primary: "#cc785c",
			primaryActive: "#db8d70",
			primaryLight: "#e0997c",
			primaryDisabled: "#3f3a33",
			ink: "#efebe4",
			body: "#a8a49c",
			bodyStrong: "#f4f1ea",
			muted: "#918d84",
			mutedSoft: "#7b776f",
			hairline: "#f4f1ea1f",
			hairlineSoft: "#f4f1ea12",
			canvas: "#1e1c18",
			surfaceSoft: "#26231e",
			surfaceCard: "#2c2924",
			surfaceElevated: "#35312a",
			surfaceCreamStrong: "#3b352d",
			onPrimary: "#181715",
			onDark: "#faf9f5",
			onDarkSoft: "#a09d96",
			accentTeal: "#6cc4b2",
			accentAmber: "#e8a55a",
			success: "#6cc07f",
			warning: "#e8a55a",
			error: "#e08080"
		};
		/** Shorthand for one per-scheme token value. */
		function pair(light, dark) {
			return {
				light,
				dark
			};
		}
		/**
		* The alias-token layer — one line per surface the palette re-colors. Every
		* name is a live token in the ui-theme sheets; values are literal colors (or
		* color-mix expressions over literals) so no consumer's own variables leak in.
		* Exported as the palette's single source of truth.
		*/
		const THEME_TOKENS = {
			"--dsw-alias-bg-base": pair(L.canvas, D.canvas),
			"--dsw-alias-bg-layer-1": pair(L.canvas, D.surfaceSoft),
			"--dsw-alias-bg-layer-2": pair(L.surfaceSoft, D.surfaceCard),
			"--dsw-alias-bg-layer-3": pair(L.surfaceCard, D.surfaceElevated),
			"--dsw-alias-bg-overlay": pair(L.canvas, D.surfaceCard),
			"--dsw-alias-bg-module-platform": pair(L.surfaceSoft, D.surfaceCard),
			"--dsw-alias-bg-multi-select": pair(L.surfaceSoft, D.surfaceCard),
			"--dsw-alias-bg-document-preview": pair(L.surfaceSoft, D.canvas),
			"--dsw-alias-bg-skeleton": pair("#1414130a", "#faf9f514"),
			"--dsw-alias-bg-document-selection": pair("color-mix(in srgb, " + L.primary + " 28%, transparent)", "color-mix(in srgb, " + L.primary + " 34%, transparent)"),
			"--dsw-alias-bg-mask-1": pair("#1414133d", "#14141380"),
			"--dsw-alias-bg-mask-2": pair("#1414131f", "#14141333"),
			"--dsw-alias-bg-mask-3": pair("#1414137a", "#1414137a"),
			"--dsw-alias-bg-mask-photo": pair("#141413e0", "#141413e0"),
			"--dsw-alias-bg-mask-drop": pair("#f5f0e4b3", "#2c2924b3"),
			"--dsw-alias-border-l1": pair(L.hairlineSoft, D.hairlineSoft),
			"--dsw-alias-border-l2": pair(L.hairline, D.hairline),
			"--dsw-alias-border-l2-darkmode-thin": pair(L.hairline, D.hairlineSoft),
			"--dsw-alias-border-l3": pair("#d6c9b4", "#f4f1ea2b"),
			"--dsw-alias-border-l4": pair("#c9baa2", "#f4f1ea36"),
			"--dsw-alias-border-inverted": pair("transparent", "#f4f1ea0f"),
			"--dsw-alias-border-inverted2": pair("transparent", "#f4f1ea14"),
			"--dsw-alias-label-primary": pair(L.ink, D.ink),
			"--dsw-alias-label-primary-dimmed": pair(L.bodyStrong, D.bodyStrong),
			"--dsw-alias-label-primary-bluish": pair(L.ink, D.ink),
			"--dsw-alias-label-primary-foreground": pair(L.onPrimary, D.onPrimary),
			"--dsw-alias-label-primary-inverted": pair(L.onDark, D.surfaceCard),
			"--dsw-alias-label-secondary": pair(L.body, D.body),
			"--dsw-alias-label-tertiary": pair(L.muted, D.muted),
			"--dsw-alias-label-caption": pair(L.mutedSoft, D.mutedSoft),
			"--dsw-alias-label-dimmed": pair(L.hairlineSoft, "#474139"),
			"--dsw-alias-label-shimmer": pair("color-mix(in srgb, " + L.ink + " 30%, transparent)", "color-mix(in srgb, " + L.onDark + " 45%, transparent)"),
			"--dsw-alias-label-deep-diving": pair(L.primaryActive, D.primaryLight),
			"--dsw-alias-label-deep-diving-shimmer": pair("#cc785c66", "#cc785c99"),
			"--dsw-alias-label-document-preview": pair(L.muted, D.body),
			"--dsw-alias-menu-icon": pair(L.body, D.bodyStrong),
			"--dsw-alias-brand-primary": pair(L.primary, D.primary),
			"--dsw-alias-brand-primary-invert": pair(L.ink, D.ink),
			"--dsw-alias-brand-text": pair(L.ink, D.ink),
			"--dsw-alias-brand-primary-new-colorprimary-new-color": pair(L.primary, D.primaryLight),
			"--dsw-alias-button-primary-fill": pair(L.primary, D.primary),
			"--dsw-alias-button-primary-hover": pair(L.primaryActive, D.primaryActive),
			"--dsw-alias-button-primary-dimmed": pair(L.primaryDisabled, D.primaryDisabled),
			"--dsw-alias-button-contrast-fill": pair(L.bodyStrong, D.onDark),
			"--dsw-alias-button-elevated-fill": pair(L.canvas, D.surfaceElevated),
			"--dsw-alias-button-floating-fill": pair(L.canvas, D.surfaceCard),
			"--dsw-alias-button-floating-hover": pair(L.surfaceSoft, D.surfaceElevated),
			"--dsw-alias-button-ghost-active-fill": pair(L.surfaceCard, D.surfaceCard),
			"--dsw-alias-button-ghost-active-hover": pair(L.surfaceCreamStrong, D.surfaceCreamStrong),
			"--dsw-alias-button-ghost-active-border": pair(L.mutedSoft, "#7a766e"),
			"--dsw-alias-button-info-fill": pair(L.primary, D.primary),
			"--dsw-alias-button-info-hover": pair(L.primaryActive, D.primaryActive),
			"--dsw-alias-button-tool-bar-fill": pair("#3d393680", "#3d393699"),
			"--dsw-alias-button-tool-bar-fill-invisible": pair("#3d39365c", "#3d39365c"),
			"--dsw-alias-button-tool-bar-hover": pair("#3d393699", "#3d3936b3"),
			"--dsw-alias-interactive-bg-hover": pair("#1414130c", "#f4f1ea14"),
			"--dsw-alias-interactive-bg-active": pair("#14141318", "#f4f1ea24"),
			"--dsw-alias-interactive-bg-hover-accent": pair("#cc785c1f", "#cc785c33"),
			"--dsw-alias-interactive-bg-hover-danger": pair("#c645451a", "#e0808029"),
			"--dsw-alias-interactive-bg-hover-solid": pair(L.surfaceSoft, D.surfaceElevated),
			"--dsw-alias-state-business-primary": pair(L.primary, D.primaryLight),
			"--dsw-alias-state-business-tertiary": pair("#f2ded1", "#35261f"),
			"--dsw-alias-state-error-primary": pair(L.error, D.error),
			"--dsw-alias-state-error-secondary": pair("#d98080", L.error),
			"--dsw-alias-state-idle-primary": pair("#c8bca6", "#5b564d"),
			"--dsw-alias-state-success-primary": pair(L.success, D.success),
			"--dsw-alias-state-success-secondary": pair("#8ecf9b", "#4a9e5c"),
			"--dsw-alias-state-success-tertiary": pair("#e2edd9", "#22301f"),
			"--dsw-alias-state-warn-label": pair("#a6790d", L.warning),
			"--dsw-alias-state-warn-primary": pair(L.warning, D.warning),
			"--dsw-alias-state-warn-secondary": pair(L.accentAmber, "#c98f3a"),
			"--dsw-alias-state-warn-tertiary": pair("#f6edd8", "#332a18"),
			"--dsw-alias-link": pair("#a4522f", D.primaryLight),
			"--dsw-alias-markdown-code-block": pair(L.surfaceSoft, D.surfaceSoft),
			"--dsw-alias-markdown-code-block-banner": pair(L.surfaceCard, D.surfaceCard),
			"--dsw-alias-markdown-inline-code": pair(L.surfaceCard, "#2f2b25"),
			"--dsw-alias-markdown-citation": pair(L.surfaceSoft, D.surfaceCard),
			"--dsw-alias-markdown-tag": pair(L.surfaceCard, D.surfaceElevated),
			"--dsw-alias-markdown-placeholder": pair(L.hairlineSoft, D.surfaceCard),
			"--dsw-alias-markdown-code-segment-selected": pair(L.canvas, D.surfaceElevated),
			"--dsw-alias-markdown-code-segment-unselected": pair(L.surfaceSoft, D.surfaceSoft),
			"--dsw-alias-turn-trigger-bg": pair(L.surfaceSoft, D.surfaceCard),
			"--dsw-alias-turn-trigger-bg-hover": pair(L.surfaceCard, D.surfaceElevated),
			"--dsw-alias-code-diff-added": pair("#5db87214", "#6cc07f1f"),
			"--dsw-alias-code-diff-deleted": pair("#c6454514", "#e080801f"),
			"--dsw-alias-file-diff-added-bg": pair("#e6eedb", "#1e2a20"),
			"--dsw-alias-file-diff-added-gutter": pair("#edf3e6", "#182019"),
			"--dsw-alias-file-diff-added-marker": pair("#4c9a5f", "#6cc07f"),
			"--dsw-alias-file-diff-deleted-bg": pair("#f6e3dc", "#33211d"),
			"--dsw-alias-file-diff-deleted-gutter": pair("#f9ede7", "#281a17"),
			"--dsw-alias-file-diff-deleted-marker": pair("#bf5a44", "#e0806a"),
			"--dsw-specific-sidebar-fill": pair(L.surfaceSoft, D.surfaceSoft),
			"--dsw-specific-bubble": pair(L.surfaceCard, D.surfaceCard),
			"--dsw-specific-bubble-highlight": pair(L.surfaceCreamStrong, D.surfaceElevated),
			"--dsw-specific-input-major": pair(L.surfaceSoft, D.surfaceCard),
			"--dsw-specific-login-input": pair("#f4eee1", D.surfaceCard),
			"--dsw-specific-selector": pair("#ece4d5", "#302c26"),
			"--dsw-specific-tip": pair(L.surfaceSoft, D.surfaceCard),
			"--dsw-specific-sidebar-nav-item-active": pair(L.surfaceCard, D.surfaceElevated),
			"--dsw-specific-sidebar-nav-item-active-accent": pair(L.surfaceCreamStrong, D.primaryDisabled),
			"--dsw-specific-sidebar-nav-item-hover": pair("#ece4d5", "#2e2a24"),
			"--dsw-menu-surface-fill": pair("#f7f2e6e8", "#2c2924d9"),
			"--dsw-alias-menu-group-header-fill": pair("#f0eaddf0", "#282520f0"),
			"--dsw-alias-settings-card-fill": pair(L.surfaceCard, D.surfaceCard),
			"--dsw-alias-settings-card-stroke": pair(L.hairline, "#f4f1ea2b"),
			"--dsw-alias-scrollbar-bg-l1": pair(L.hairline, D.primaryDisabled),
			"--dsw-alias-scrollbar-bg-l2": pair("#d3c6b0", "#43403a"),
			"--dsw-alias-scrollbar-hover-l1": pair("#cabc9f", "#4a463f"),
			"--dsw-alias-scrollbar-hover-l2": pair("#c3b49c", "#54504a"),
			"--dsw-alias-switch-thumb": pair("#ffffff", L.mutedSoft),
			"--dsw-alias-toast-bg": pair("#181715", "#35312a"),
			"--dsw-alias-toast-label": pair(L.onDark, L.onDark),
			"--dsw-alias-tooltip-bg": pair(L.bodyStrong, D.surfaceElevated),
			"--dsw-alias-tooltip-key-bg": pair("#3a3733", "#464038"),
			"--dsw-alias-onboarding-accent": pair(L.primary, D.primaryLight),
			"--dsw-alias-onboarding-card-fill": pair("#f7f2e6cc", "#2c2924cc"),
			"--dsw-alias-onboarding-secondary-fill": pair(L.canvas, D.surfaceElevated),
			"--dsw-alias-onboarding-checkbox-border": pair("#14141333", "#faf9f533"),
			"--dsw-shadow-lv1": pair("0 1px 3px 0 #14141314", "0 1px 3px 0 #00000059"),
			"--dsw-shadow-lv1-blur": pair("0 4px 12px 0 #1414130f", "0 4px 12px 0 #0000004d"),
			"--dsw-shadow-lv2": pair("0 1px 3px 0 #14141314, 0 4px 12px 0 #14141314", "0 1px 3px 0 #00000059, 0 4px 12px 0 #0000004d"),
			"--dsw-shadow-lv3": pair("0 0 1px 0 #1414131f, 0 8px 24px 0 #1414131f", "0 0 1px 0 #00000080, 0 8px 24px 0 #00000080"),
			"--dsw-linear-gradient-think": pair("linear-gradient(180deg, " + L.canvas + " 20.19%, " + L.canvas + "00 100%)", "linear-gradient(180deg, " + D.canvas + " 20.19%, " + D.canvas + "00 100%)"),
			"--dsw-linear-think-select": pair("linear-gradient(180deg, " + L.surfaceSoft + " 20.19%, " + L.surfaceSoft + "00 100%)", "linear-gradient(180deg, " + D.surfaceCard + " 20.19%, " + D.surfaceCard + "00 100%)")
		};
		/**
		* The stylesheet half: `html:root` deliberately outranks ui-theme's own
		* `:root` declarations so the plugin does not depend on style-tag order, while
		* still sitting *behind* the user's font preferences (ui-theme composes
		* `--dsw-font-family` as the user's list, then these defaults, so a chosen
		* font keeps winning).
		*/
		/** Display serif stack: Copernicus / Tiempos Headline, then the open-source
		*  stand-ins the design system names (Cormorant Garamond, EB Garamond), then the
		*  CJK serif faces so Chinese headings keep the editorial voice. */
		const DISPLAY_FAMILY = "\"Copernicus\", \"Tiempos Headline\", \"Cormorant Garamond\", \"EB Garamond\", Garamond, \"Times New Roman\", \"Songti SC\", \"Noto Serif CJK SC\", \"Noto Serif SC\", SimSun, serif";
		const THEME_CSS = [
			"html:root {",
			"  /* Typography: the editorial split of the design system — humanist sans for",
			"     interface and prose, monospace for code, display serif for headings and",
			"     brand text. Each list falls through to platform faces (CJK ones included),",
			"     so text never drops to a bare generic. */",
			"  --dsh-font-family-text-default: \"StyreneB\", \"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;",
			"  --dsh-font-family-code-default: \"JetBrains Mono\", \"SF Mono\", \"Fira Code\", Consolas, \"Liberation Mono\", Menlo, \"PingFang SC\", \"Microsoft YaHei\", monospace;",
			"  --dsw-font-family-brand: " + DISPLAY_FAMILY + ";",
			"  /* Corner radius scale of the design system, one step tighter than the",
			"     platform default so surfaces keep the crisp printed feel. */",
			"  --dsw-radius-xs: 4px;",
			"  --dsw-radius-sm: 6px;",
			"  --dsw-radius-md: 8px;",
			"  --dsw-radius-lg: 12px;",
			"  --dsw-radius-xl: 16px;",
			"  --dsw-radius-panel: 16px;",
			"}",
			"/* Markdown headings carry the display serif plus the two rules that keep it",
			"   editorial: weight 400 (the display face never bolds) and negative tracking",
			"   that tightens as the size grows. data-chat-flow is the stable chat-column",
			"   hook, so this holds across builds without naming any hashed class. */",
			"[data-chat-flow] h1,",
			"[data-chat-flow] h2,",
			"[data-chat-flow] h3,",
			"[data-chat-flow] h4 {",
			"  font-family: " + DISPLAY_FAMILY + ";",
			"  font-weight: 400;",
			"  letter-spacing: -0.3px;",
			"}",
			"[data-chat-flow] h1 { letter-spacing: -1px; }",
			"[data-chat-flow] h2 { letter-spacing: -0.5px; }",
			""
		].join("\n");
		/**
		* Stack the palette over whatever theme the user picked.
		* @param theme - the ui-theme service surface.
		* @returns a disposer removing exactly this token layer.
		*/
		function applyThemeTokens(theme) {
			return theme.overrideTokens(THEME_SOURCE, THEME_TOKENS);
		}
		/**
		* Inject the stylesheet half (fonts, radii, heading faces).
		* @returns a disposer that removes the style tag.
		*/
		function applyThemeStyle() {
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(STYLE_ID$4) + "]") !== null) return () => {};
			const style = document.createElement("style");
			style.dataset.plugin = PLUGIN_ID$4;
			style.dataset.pluginCss = STYLE_ID$4;
			style.textContent = THEME_CSS;
			document.head.append(style);
			return () => {
				style.remove();
			};
		}
		// src/client/sidebar-panels.ts
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
		const PLUGIN_ID$3 = "dsh-ui-interaction";
		/** id stamped onto the injected <style> so the loader can find plugin-owned css. */
		const STYLE_ID$3 = PLUGIN_ID$3 + "/sidebar-panels";
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
		const LIST = "[class*=\"_panelList\"]:not([class*=\"_collapsed\"] *)";
		/**
		* The grid. Two equal columns, a 2px row gap to keep the pair rhythm of the
		* original stack, and a slightly wider column gap so the two cells read as
		* separate targets. Children are wrapped by the primitives' Tooltip, so each
		* direct child becomes a stretching flex box and the row button fills it.
		*/
		const SIDEBAR_PANEL_CSS = [
			LIST + " {",
			"  display: grid;",
			"  grid-template-columns: repeat(auto-fit, minmax(104px, 1fr));",
			"  grid-auto-rows: 32px;",
			"  gap: 2px 4px;",
			"}",
			LIST + " > * {",
			"  display: flex;",
			"  min-width: 0;",
			"}",
			LIST + " [class*=\"_panelRow\"] {",
			"  box-sizing: border-box;",
			"  flex: 1 1 auto;",
			"  width: 100%;",
			"  min-width: 0;",
			"  height: 32px;",
			"  min-height: 32px;",
			"  margin: 0;",
			"  padding: 0 8px;",
			"  gap: 6px;",
			"  line-height: 20px;",
			"}",
			LIST + " [class*=\"_panelTitle\"] {",
			"  font-size: 13px;",
			"  line-height: 20px;",
			"}",
			LIST + " > *:last-child:nth-child(odd) {",
			"  grid-column: 1 / -1;",
			"}",
			""
		].join("\n");
		/**
		* Mount the two-column panel grid.
		* @returns a disposer that removes the style tag.
		*/
		function applySidebarPanelGrid() {
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(STYLE_ID$3) + "]") !== null) return () => {};
			const style = document.createElement("style");
			style.dataset.plugin = PLUGIN_ID$3;
			style.dataset.pluginCss = STYLE_ID$3;
			style.textContent = SIDEBAR_PANEL_CSS;
			document.head.append(style);
			return () => {
				style.remove();
			};
		}
		// src/client/sidebar-cta.ts
		/**
		* Sidebar "New Session" primary CTA. The sidebar's New Session button ships as a
		* neutral surface button — canvas fill (`--dsw-alias-button-elevated-fill`), a
		* one-pixel hairline, ink label — which reads as one more row next to the panel
		* list rather than as the column's primary action. This layer paints it with the
		* composer's send button palette instead: the coral `button-info-fill` as the
		* fill, white as the label, and `button-info-hover` on hover.
		*
		* Both surfaces therefore read from the same two tokens, so the theme stays the
		* single source of the color and a future re-tint moves both together.
		*
		* Scope: the expanded column only. In the collapsed rail the same button is a
		* 36x36 borderless icon button (`…_collapsed` on the sidebar root), where a
		* coral block would be a heavy dot; the rail keeps its own treatment.
		*
		* Pure presentation: no data, no slots, no commands, nothing model-visible.
		*/
		/** The plugin's own element namespace, matching the other surfaces. */
		const PLUGIN_ID$2 = "dsh-ui-interaction";
		/** id stamped onto the injected <style> so the loader can find plugin-owned css. */
		const STYLE_ID$2 = PLUGIN_ID$2 + "/sidebar-cta";
		/**
		* The button, matched by its stable `_newSession` class suffix (the hashed
		* module prefix changes per build), minus the collapsed rail. The
		* `body`-anchored selector plus the `:not()` keep specificity above
		* ui-sidebar's own platform and rail rules without resorting to `!important`.
		*/
		const BUTTON = "body [class$=\"_newSession\"]:not([class*=\"_collapsed\"] *)";
		const SIDEBAR_CTA_CSS = [
			BUTTON + " {",
			"  background: var(--dsw-alias-button-info-fill);",
			"  border-color: transparent;",
			"  color: #ffffff;",
			"}",
			BUTTON + ":hover {",
			"  background: var(--dsw-alias-button-info-hover);",
			"}",
			BUTTON + " [class$=\"_newSessionShortcut\"] {",
			"  color: #ffffff;",
			"}",
			""
		].join("\n");
		/**
		* Mount the New Session CTA restyle.
		* @returns a disposer that removes the style tag.
		*/
		function applySidebarCta() {
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(STYLE_ID$2) + "]") !== null) return () => {};
			const style = document.createElement("style");
			style.dataset.plugin = PLUGIN_ID$2;
			style.dataset.pluginCss = STYLE_ID$2;
			style.textContent = SIDEBAR_CTA_CSS;
			document.head.append(style);
			return () => {
				style.remove();
			};
		}
		// src/client/composer-frame.ts
		/**
		* Composer frame: give the message input a visible highlight edge.
		*
		* The composer card carries no CSS border at all — its edge is the shared
		* elevation hairline (`--dsw-elevation-soft` draws `0 0 0 .5px` in
		* `--dsw-alias-border-l2`), which is the same warm tone as the card fill
		* (`--dsw-specific-input-major`). On the warm-paper theme that 0.5px line is
		* barely distinguishable, so the field does not read as a field.
		*
		* This layer adds a coral ring around the card and deepens it while the card has
		* focus. An `outline` is used on purpose: it paints over the existing hairline
		* and follows the card's border radius, but takes no space in layout, so the
		* composer cannot change size when the ring appears. The ring colour is mixed
		* with the card fill rather than a fixed hex, so it stays in palette in the
		* light and the dark theme alike.
		*
		* Pure presentation: no data, no slots, no commands, nothing model-visible.
		*/
		/** The plugin's own element namespace, matching the other surfaces. */
		const PLUGIN_ID$1 = "dsh-ui-interaction";
		/** id stamped onto the injected <style> so the loader can find plugin-owned css. */
		const STYLE_ID$1 = PLUGIN_ID$1 + "/composer-frame";
		/**
		* The composer card. ui-conversation stamps the stable `data-composer-card`
		* attribute on the element, so no hashed class name is involved.
		*/
		const CARD = "[data-composer-card]";
		const COMPOSER_FRAME_CSS = [
			CARD + " {",
			"  outline: 1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 65%, var(--dsw-specific-input-major));",
			"  outline-offset: -1px;",
			"  transition: outline-color .15s var(--ds-ease-in-out, ease-in-out);",
			"}",
			CARD + ":focus-within {",
			"  outline-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 90%, var(--dsw-specific-input-major));",
			"}",
			""
		].join("\n");
		/**
		* Mount the composer frame ring.
		* @returns a disposer that removes the style tag.
		*/
		function applyComposerFrame() {
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(STYLE_ID$1) + "]") !== null) return () => {};
			const style = document.createElement("style");
			style.dataset.plugin = PLUGIN_ID$1;
			style.dataset.pluginCss = STYLE_ID$1;
			style.textContent = COMPOSER_FRAME_CSS;
			document.head.append(style);
			return () => {
				style.remove();
			};
		}
		// src/client/branding.ts
		/**
		* Branding retouch for the neon-chrome profile: drop the DeepSeek whale/fish
		* logo marks while KEEPING the brand text.
		*
		* dsh 0.1.7 split branding into independent slots (`sidebar.brand.mark` /
		* `sidebar.brand.name`) and gave `BrandWordmark` an `includeMark` switch, so
		* the mark and the name are now separable. The shipped official brand package
		* (`@deepseek-ai/dsh-client-ui-brand-official`) fills the sidebar with
		* `FishLogo` for the mark slot and a mark-less wordmark for the name slot.
		* That means hiding the fish mark alone is now exactly "no logo, brand text
		* unchanged" — the whole-wordmark hide the 0.1.5 build needed is obsolete and
		* would have taken the brand text with it.
		*
		* Pure CSS so it survives React reconciliation — the svg is hidden, not
		* deleted, because deleting it lets React re-create it.
		*
		* Targets ride one stable DOM signature, never a hashed class prefix: the
		* `FishLogo` svg's `viewBox`, which is rendered from `FISH_LOGO_VIEWBOX`
		* (`{ width: 23.16, height: 17.04 }`) as a template literal and therefore
		* still lands in the DOM as the literal attribute `0 0 23.16 17.04`. That one
		* rule covers every fish mark: the sidebar brand mark slot (collapsed rail and
		* expanded header) and the conversation hero's animated fish.
		*
		* No data, no slots, nothing model-visible.
		*/
		/** The plugin's own element namespace, matching the other surfaces. */
		const PLUGIN_ID = "dsh-ui-interaction";
		/** id stamped onto the injected <style> so the loader can find plugin-owned css. */
		const STYLE_ID = `${PLUGIN_ID}/branding`;
		/**
		* Global stylesheet for the branding retouch: hide the whale/fish logo svg by
		* its stable viewBox. The brand text is deliberately left alone.
		*/
		const GLOBAL_CSS = `
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
		// src/client/index.ts
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
			ctx.effect(() => applyThemeStyle(), "dsh-ui-interaction: theme stylesheet");
			ctx.inject(["theme"], (scope) => {
				const theme = scope.get("theme");
				if (theme === void 0) return;
				scope.effect(() => applyThemeTokens(theme), "dsh-ui-interaction: theme tokens");
			});
			ctx.effect(() => applySidebarPanelGrid(), "dsh-ui-interaction: sidebar panel grid");
			ctx.effect(() => applySidebarCta(), "dsh-ui-interaction: sidebar new-session cta");
			ctx.effect(() => applyComposerFrame(), "dsh-ui-interaction: composer frame");
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
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map