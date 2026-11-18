/**
 * Slot declarations and injected faces of this bundle's two surfaces: the
 * composer's model seat (with its native options child) and the switches card
 * on the Plugins page. The target 'conversation.input.model' seat is
 * declared (children table) and typed by ui-conversation's composer-bar
 * entry. Its native options child is retained so independent session controls,
 * including Agent Teams, can contribute to the root menu.
 */
import type { ModelSelection } from '@deepseek-ai/dsh-api-session-controller/types'
import type { SnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { ModelDirectoryState } from './directory.ts'

/** Owner contract of the native model-menu extension point. */
export interface ModelMenuOptionsOwner {
  locked: boolean
  dismiss: () => void
  reportFailure: (message: string) => void
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'conversation.input.model.options': {
      kind: 'list'
      scope: 'session'
      owner: ModelMenuOptionsOwner
    }
    /**
     * The Plugins page's own-bundle configuration cell, keyed by package name
     * and rendered on that bundle's page. Declared here rather than imported:
     * the plugin-manager package is a Host composition this bundle must not
     * depend on, and only the `view` share is read here.
     */
    'plugins.bundle.config': {
      kind: 'keyed'
      scope: 'root'
      owner: { readonly view: 'summary' | 'page' }
    }
  }
}

/** Injected business face of the composer model seat. */
export interface ModelSelectInjected {
  /** Whether this session supports Agent-bound model inspection and selection. */
  available: boolean
  /** The session's shared directory store (same instance the /model popup reads). */
  directory: SnapshotStore<ModelDirectoryState>
  /** Refresh the advisory directory (fire-and-forget; errors land on the store). */
  load: () => void
  /**
   * Select a complete provider/model/reasoning selection.
   * @param selection - model selection and optional adapter-owned effort.
   * @returns whether the host accepted the selection.
   */
  select: (selection: ModelSelection) => Promise<boolean>
}
