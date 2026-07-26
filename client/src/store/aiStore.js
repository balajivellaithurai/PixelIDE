/**
 * Dedicated Zustand Store for PixelIDE AI Foundation Infrastructure
 * Manages loading states, active actions, responses, error payloads, request cancellation,
 * provider configuration, response history, last request tracking, and AI sidebar UI visibility.
 */

import { create } from "zustand";
import aiConfigManager from "../ai/config/aiConfig";
import { AIError, AIErrorType } from "../ai/errors/aiErrors";

export const AIActionType = {
  REVIEW: "REVIEW",
  DEBUG: "DEBUG",
  EXPLAIN: "EXPLAIN",
  OPTIMIZE: "OPTIMIZE",
  TESTS: "TESTS",
  DOCS: "DOCS",
  INTERVIEW: "INTERVIEW",
  CUSTOM: "CUSTOM",
};

// Module-scoped map to store active AbortControllers cleanly outside Zustand serializable state
const activeAbortControllers = new Map();

const useAIStore = create((set, get) => ({
  // UI Sidebar State
  isOpen: false,
  selectedAction: null,
  showHistoryView: false,

  // Execution & Foundation State
  isLoading: false,
  isStreaming: false,
  currentAction: null,
  response: null,
  responseMetadata: null, // Holds metadata: { filename, language, action, durationMs, estimatedTokens, generatedAt }
  error: null,
  lastRequest: null, // Tracks last execution payload for Retry functionality
  lastContext: null, // Context object of last AI request
  history: [],
  provider: aiConfigManager.getProvider(),
  model: aiConfigManager.getModel(),
  temperature: aiConfigManager.getTemperature(),
  apiKey: aiConfigManager.getApiKey(),

  // UI Actions
  openSidebar: () => set({ isOpen: true }),
  closeSidebar: () => set({ isOpen: false }),
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  toggleHistoryView: () => set((state) => ({ showHistoryView: !state.showHistoryView })),
  setShowHistoryView: (showHistoryView) => set({ showHistoryView }),
  selectAction: (action) => set({ selectedAction: action }),
  setLoading: (isLoading) => set({ isLoading }),

  /**
   * Initializes action execution state and returns an AbortSignal for the request.
   */
  startAction: (actionType, requestMeta = null) => {
    // Cancel any existing pending action
    get().cancelAction();

    const controller = new AbortController();
    const requestId = crypto.randomUUID();
    activeAbortControllers.set(requestId, controller);

    const context = requestMeta?.context || null;

    set({
      isLoading: true,
      currentAction: actionType,
      selectedAction: actionType,
      showHistoryView: false,
      response: null,
      responseMetadata: null,
      error: null,
      ...(requestMeta ? { lastRequest: requestMeta } : {}),
      ...(context ? { lastContext: context } : {}),
    });

    return { requestId, signal: controller.signal };
  },

  /**
   * Sets successful response and records item in history.
   */
  setResponse: (requestId, responseText, meta = {}) => {
    if (requestId) {
      activeAbortControllers.delete(requestId);
    }

    const currentAction = get().currentAction || meta.action || "AI Output";
    const filename = meta.context?.filename || meta.filename || "file";
    const language = meta.context?.language || meta.language || "code";

    const metadata = {
      filename,
      language,
      action: currentAction,
      durationMs: meta.durationMs || 0,
      estimatedTokens: meta.estimatedTokens || Math.ceil((responseText.length || 0) / 4),
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestamp: new Date().toISOString(),
    };

    const newHistoryItem = {
      id: crypto.randomUUID(),
      action: currentAction,
      filename,
      language,
      response: responseText,
      timestamp: metadata.generatedAt,
      context: meta.context || get().lastContext,
      metadata,
    };

    set((state) => ({
      isLoading: false,
      isStreaming: false,
      response: responseText,
      responseMetadata: metadata,
      error: null,
      history: [newHistoryItem, ...state.history].slice(0, 50), // keep max 50 items
    }));
  },

  /**
   * Restores a past item from history to active response view.
   */
  restoreHistoryItem: (item) => {
    set({
      response: item.response,
      responseMetadata: item.metadata || {
        filename: item.filename || "file",
        language: item.language || "code",
        action: item.action || "History",
        generatedAt: item.timestamp,
      },
      currentAction: item.action,
      selectedAction: item.action,
      showHistoryView: false,
      error: null,
    });
  },

  /**
   * Sets structured AI error state.
   */
  setError: (requestId, errorPayload) => {
    if (requestId) {
      activeAbortControllers.delete(requestId);
    }

    let formattedError;
    if (errorPayload instanceof AIError) {
      formattedError = errorPayload.toJSON();
    } else if (errorPayload instanceof Error) {
      formattedError = {
        type: AIErrorType.UNKNOWN_ERROR,
        message: errorPayload.message,
        details: errorPayload.stack,
        timestamp: new Date().toISOString(),
      };
    } else {
      formattedError = {
        type: AIErrorType.UNKNOWN_ERROR,
        message: String(errorPayload || "Unknown AI error occurred"),
        details: null,
        timestamp: new Date().toISOString(),
      };
    }

    set({
      isLoading: false,
      isStreaming: false,
      error: formattedError,
    });
  },

  /**
   * Aborts active pending AI request.
   */
  cancelAction: () => {
    activeAbortControllers.forEach((controller) => {
      try {
        controller.abort(new Error("User cancelled operation"));
      } catch {
        // Ignore abort errors
      }
    });
    activeAbortControllers.clear();

    if (get().isLoading) {
      set({
        isLoading: false,
        isStreaming: false,
        error: new AIError(AIErrorType.CANCELLED).toJSON(),
      });
    }
  },

  /**
   * Clears error state.
   */
  clearError: () => set({ error: null }),

  /**
   * Resets response and error.
   */
  clearResponse: () =>
    set({ response: null, responseMetadata: null, error: null, currentAction: null, selectedAction: null }),

  /**
   * Clears request history.
   */
  clearHistory: () => set({ history: [] }),

  /**
   * Updates AI Provider configuration dynamically at runtime.
   */
  setProviderConfig: (configUpdates = {}) => {
    const updated = aiConfigManager.updateConfig(configUpdates);
    set({
      provider: updated.provider,
      model: updated.model,
      temperature: updated.temperature,
      apiKey: updated.apiKey,
    });
  },
}));

export default useAIStore;
