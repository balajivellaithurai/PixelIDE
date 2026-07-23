/**
 * Dedicated Zustand Store for PixelIDE AI Foundation Infrastructure
 * Manages loading states, active actions, responses, error payloads, request cancellation,
 * provider configuration, and response history.
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
  isLoading: false,
  isStreaming: false,
  currentAction: null,
  response: null,
  error: null,
  history: [],
  provider: aiConfigManager.getProvider(),
  model: aiConfigManager.getModel(),
  temperature: aiConfigManager.getTemperature(),
  apiKey: aiConfigManager.getApiKey(),

  /**
   * Initializes action execution state and returns an AbortSignal for the request.
   */
  startAction: (actionType) => {
    // Cancel any existing pending action
    get().cancelAction();

    const controller = new AbortController();
    const requestId = crypto.randomUUID();
    activeAbortControllers.set(requestId, controller);

    set({
      isLoading: true,
      currentAction: actionType,
      response: null,
      error: null,
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

    const newHistoryItem = {
      id: crypto.randomUUID(),
      action: get().currentAction,
      response: responseText,
      timestamp: new Date().toISOString(),
      ...meta,
    };

    set((state) => ({
      isLoading: false,
      isStreaming: false,
      response: responseText,
      error: null,
      history: [newHistoryItem, ...state.history].slice(0, 50), // keep max 50 items
    }));
  },

  /**
   * Sets structured AI error state.
   */
  setError: (requestId, errorPayload) => {
    if (requestId) {
      activeAbortControllers.delete(requestId);
    }

    let formattedError = null;
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
      } catch (_) {}
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
  clearResponse: () => set({ response: null, error: null, currentAction: null }),

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
