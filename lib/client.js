window.__ModuleLoader__.load({
	id: "dsh-ui-interaction",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_cordis = require("@deepseek-ai/cordis");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
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
		//#region src/client/directory.ts
		/** One session's shared directory controller; disposed with the session scope. */
		var ModelDirectory = class {
			/**
			* @param sessions - the session wire face (captured from the plugin's root connection).
			* @param sessionId - the owning session.
			* @param available - whether this session may use Agent-bound model RPCs.
			*/
			constructor(sessions, sessionId, available) {
				this.sessions = sessions;
				this.sessionId = sessionId;
				this.available = available;
				_defineProperty(this, "store", (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)({
					current: null,
					routable: null,
					groups: [],
					failures: [],
					status: "idle",
					error: null
				}));
				_defineProperty(this, "generation", 0);
				_defineProperty(this, "disposed", false);
			}
			/**
			* Refresh the advisory directory (both entries call this on open).
			* Failure preserves the last good groups and current selection.
			* @returns the fresh directory value.
			*/
			async load() {
				this.assertAvailable();
				const generation = ++this.generation;
				this.store.update((s) => {
					s.status = "loading";
					s.error = null;
				});
				const { result } = await this.sessions.models({ sessionId: this.sessionId });
				if (this.disposed || generation !== this.generation) {
					if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
					return result.value;
				}
				if (!result.ok) {
					this.store.update((s) => {
						s.status = "error";
						s.error = `${result.error.code}: ${result.error.message}`;
					});
					throw new Error(`session.models failed: ${result.error.code}: ${result.error.message}`);
				}
				const { current, routable, groups, failures } = result.value;
				this.store.update((s) => {
					s.current = current;
					s.routable = routable;
					s.groups = groups;
					s.failures = failures;
					s.status = "ready";
					s.error = null;
				});
				return result.value;
			}
			/**
			* Select the complete provider/model/reasoning selection (both entries submit through here). Success
			* updates the shared current; failure surfaces on the store and throws so
			* each entry's own retry surface engages.
			* @param selection - provider, provider-owned model id, and optional adapter-owned effort.
			*/
			async select(selection) {
				this.assertAvailable();
				const generation = ++this.generation;
				this.store.update((s) => {
					s.status = "selecting";
					s.error = null;
				});
				const { result } = await this.sessions.selectModel({
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
					s.current = result.value.selected;
					s.routable = true;
					s.status = "ready";
					s.error = null;
				});
			}
			/**
			* Drop the previous Host generation's projection and repull it. Clearing
			* first prevents an unconsumed process-local selection from being displayed
			* while the restarted Host has restored the last logged model selection.
			*/
			resetConnected() {
				if (this.disposed) return;
				++this.generation;
				this.store.update((s) => {
					s.current = null;
					s.routable = null;
					s.groups = [];
					s.failures = [];
					s.status = "idle";
					s.error = null;
				});
				if (!this.available()) return;
				this.load().catch(() => {});
			}
			/** Scope teardown: late settlements lose write access to the store. */
			dispose() {
				this.disposed = true;
			}
			assertAvailable() {
				if (!this.available()) throw new Error("model selection is unavailable for addressed subagent sessions");
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
				_defineProperty(this, "blockReason", void 0);
				this.blockReason = config.blockReason;
				ctx.on("connection/reset", () => {
					for (const directory of this.live.directories.values()) directory.resetConnected();
				});
				const refresh = () => {
					for (const directory of this.live.directories.values()) directory.load().catch(() => void 0);
				};
				ctx.remote.$on("llm/adapters-updated", refresh);
				ctx.remote.$on("settings/document-updated", refresh);
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
				const sessions = this.ctx.get("sessions");
				const actx = sessions.scope(sessionId);
				if (actx === void 0) throw new Error(`dsh-ui-interaction: session "${String(sessionId)}" resolved no scope`);
				const directory = new ModelDirectory(this.ctx.get("connection").api.sessions, sessionId, () => sessions.subagentAddress(sessionId) === void 0);
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
			"connection",
			"sessions",
			"remote"
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
		const css = ".NOMXla_root{min-width:0;position:relative}.NOMXla_trigger{min-width:0;max-width:220px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}.NOMXla_trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.NOMXla_trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}.NOMXla_trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}.NOMXla_triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.NOMXla_triggerEffort{color:var(--dsw-alias-label-caption);flex:none}.NOMXla_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s}.NOMXla_chevronOpen{transform:rotate(180deg)}.NOMXla_menu{z-index:20;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);width:min(240px,100vw - 32px);max-height:min(360px,100vh - 96px);box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border-radius:12px;flex-direction:column;padding:4px;display:flex;position:absolute;bottom:calc(100% + 8px);right:0;overflow:hidden}.NOMXla_status,.NOMXla_empty{color:var(--dsw-alias-label-tertiary);padding:10px;font-size:13px;line-height:20px}.NOMXla_error,.NOMXla_warning{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:8px;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;padding:7px 8px;font-size:12px;line-height:18px;display:flex}.NOMXla_warning{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-state-warn-label)}.NOMXla_retry{color:inherit;font:inherit;cursor:pointer;background:0 0;border:none;flex:none;padding:0;font-weight:600}.NOMXla_groups{flex:auto;min-height:0;overflow-y:auto}.NOMXla_provider{width:100%;min-height:38px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border:none;border-radius:10px;outline:none;align-items:center;gap:8px;padding:6px 8px;font-size:14px;font-weight:500;line-height:20px;display:flex}.NOMXla_provider:hover:not(:disabled),.NOMXla_provider:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}.NOMXla_provider+.NOMXla_provider{margin-top:2px}.NOMXla_back{width:100%;height:34px;color:var(--dsw-alias-label-tertiary);cursor:pointer;text-align:left;background:0 0;border:none;border-radius:10px;outline:none;flex:none;align-items:center;gap:4px;padding:0 8px;font-size:13px;line-height:20px;display:flex}.NOMXla_back:hover,.NOMXla_back:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}.NOMXla_backChevron{color:inherit;flex:none}.NOMXla_option{width:100%;min-height:38px;color:inherit;text-align:left;cursor:pointer;background:0 0;border:none;border-radius:10px;outline:none;align-items:center;gap:8px;padding:6px 8px;display:flex}.NOMXla_option:hover:not(:disabled),.NOMXla_option:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}.NOMXla_selected{background:0 0}.NOMXla_option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}.NOMXla_optionCopy{flex-direction:column;flex:1;min-width:0;display:flex}.NOMXla_modelName{color:inherit;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:20px;overflow:hidden}.NOMXla_description{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}.NOMXla_check{color:var(--dsw-alias-label-primary);flex:0 0 18px;place-items:center;display:grid}.NOMXla_cell{width:100%;height:40px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border:none;border-radius:10px;align-items:center;gap:8px;padding:0 10px;font-size:14px;line-height:22px;display:flex}.NOMXla_cell:hover{background:var(--dsw-alias-interactive-bg-hover)}.NOMXla_cellLabel{text-overflow:ellipsis;white-space:nowrap;flex:auto;min-width:0;overflow:hidden}.NOMXla_cellValue{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-tertiary);flex:0 auto;overflow:hidden}.NOMXla_cellChevron{color:var(--dsw-alias-label-tertiary);flex:none}";
		const tagId = "dsh-ui-interaction/ModelSelect.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-ui-interaction";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ModelSelect_module_css_default = {
			"menu": "NOMXla_menu",
			"back": "NOMXla_back",
			"check": "NOMXla_check",
			"cellLabel": "NOMXla_cellLabel",
			"backChevron": "NOMXla_backChevron",
			"chevronOpen": "NOMXla_chevronOpen",
			"option": "NOMXla_option",
			"cell": "NOMXla_cell",
			"groups": "NOMXla_groups",
			"triggerEffort": "NOMXla_triggerEffort",
			"error": "NOMXla_error",
			"status": "NOMXla_status",
			"chevron": "NOMXla_chevron",
			"warning": "NOMXla_warning",
			"cellValue": "NOMXla_cellValue",
			"root": "NOMXla_root",
			"retry": "NOMXla_retry",
			"provider": "NOMXla_provider",
			"selected": "NOMXla_selected",
			"triggerLabel": "NOMXla_triggerLabel",
			"trigger": "NOMXla_trigger",
			"modelName": "NOMXla_modelName",
			"cellChevron": "NOMXla_cellChevron",
			"optionCopy": "NOMXla_optionCopy",
			"description": "NOMXla_description",
			"empty": "NOMXla_empty"
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
		*/
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
				if (available) {
					lastActionRef.current = "load";
					load();
				}
			}, [available, load]);
			(0, react.useEffect)(() => {
				if (!open) return;
				const closeOutside = (event) => {
					if (!rootRef.current?.contains(event.target)) setOpen(false);
				};
				document.addEventListener("mousedown", closeOutside);
				return () => {
					document.removeEventListener("mousedown", closeOutside);
				};
			}, [open]);
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
				if (event.relatedTarget instanceof Node && rootRef.current?.contains(event.relatedTarget)) return;
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
			const modelLabel = currentChoice?.model.name ?? t("trigger.fallback");
			const triggerLabel = effortLabel === void 0 ? modelLabel : `${modelLabel} · ${effortLabel}`;
			const triggerAria = currentChoice === void 0 ? t("trigger.selectAria") : effortLabel === void 0 ? t("trigger.aria", { model: modelLabel }) : t("trigger.ariaEffort", {
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
					open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						id: `${id}-menu`,
						className: ModelSelect_module_css_default.menu,
						role: "menu",
						"aria-label": t("menu.aria"),
						"aria-busy": state.status === "loading" || busy,
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
										children: t("retry")
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
										children: t("retry")
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
											className: clsx(ModelSelect_module_css_default.provider, selected && ModelSelect_module_css_default.selected),
											title: group.name,
											onClick: () => {
												openModels(group.id);
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: ModelSelect_module_css_default.cellLabel,
												children: group.name
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, { className: ModelSelect_module_css_default.cellChevron })]
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
												}), model.description !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: ModelSelect_module_css_default.description,
													children: model.description
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
					}),
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
		//#region src/client/locales.ts
		/**
		* `model` namespace dictionaries.
		*
		* `trigger.selectAria` reads identically to `trigger.fallback` today and is
		* still a separate key: the visible fallback label and the accessible name of
		* an unset trigger are free to diverge per locale, and folding it into
		* `trigger.aria` would announce the degenerate "Select model, current Select
		* model".
		*/
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"command.description": "选择本会话使用的模型",
			"option.loadError": "目录加载失败：{message}",
			"trigger.fallback": "选择模型",
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
			"trigger.fallback": "Select model",
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
		//#region src/client/index.ts
		/** One selectable row's id: an opaque row key (resolved by lookup, never parsed). */
		function rowId(providerId, modelId) {
			return `${providerId}/${modelId}`;
		}
		/** Flatten the directory into popup rows; failure rows are listed for visibility but never selectable. */
		function optionsOf(directory, t) {
			const rows = [];
			for (const group of directory.groups) for (const model of group.models) rows.push({
				id: rowId(group.id, model.id),
				label: model.name,
				detail: model.description !== void 0 ? `${group.name} · ${model.description}` : group.name,
				...directory.current.provider === group.id && directory.current.model === model.id ? { active: true } : {}
			});
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
			"connection",
			"locale",
			"sessions",
			"slots",
			"remote"
		];
		/**
		* Client plugin body: mount ModelDirectoryResolver, register the `model`
		* dictionaries, then register the /model popup contribution and the composer
		* model seat over the service.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
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
					description: t("command.description"),
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