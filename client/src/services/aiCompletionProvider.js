/**
 * Monaco AI Inline Completion Provider for Pix / PixelIDE (Sprint 14)
 * Provides ghost text code completions as the user types in Monaco Editor.
 * Includes debouncing, context window optimization, cancellation, and silent error handling.
 */

import providerFactory from "../ai/providers/AIProviderFactory";
import aiConfigManager from "../ai/config/aiConfig";
import { inlineCompletionPrompt } from "../ai/prompts/promptTemplates";
import useAIStore from "../store/aiStore";

let activeDebounceTimer = null;
let activeAbortController = null;
let registeredDisposables = [];

/**
 * Registers the Pix AI Inline Completion Provider for Monaco Editor across supported languages.
 * @param {Object} monaco - Monaco Editor global instance
 */
export const registerAIInlineCompletionProvider = (monaco) => {
  if (!monaco) return;

  // Clean up any existing providers
  disposeAIInlineCompletionProvider();

  const supportedLanguages = [
    "javascript",
    "typescript",
    "python",
    "cpp",
    "c",
    "java",
    "html",
    "css",
    "json",
  ];

  const provider = {
    provideInlineCompletions: async (model, position, context, token) => {
      const settings = useAIStore.getState().aiSettings || {};

      // 1. Respect user settings
      if (settings.aiCompletionEnabled === false || settings.inlineSuggestionsEnabled === false) {
        return { items: [] };
      }

      // 2. Clear existing debounce timer and pending abort controller
      if (activeDebounceTimer) {
        clearTimeout(activeDebounceTimer);
        activeDebounceTimer = null;
      }
      if (activeAbortController) {
        activeAbortController.abort();
        activeAbortController = null;
      }

      const delayMs = settings.completionDelay || 300;

      // 3. Debounce execution
      await new Promise((resolve) => {
        activeDebounceTimer = setTimeout(resolve, delayMs);
      });

      if (token.isCancellationRequested) {
        return { items: [] };
      }

      // 4. Build Context Window (limited to ~30 lines above and ~10 lines below)
      const currentLine = position.lineNumber;
      const currentColumn = position.column;
      const lineCount = model.getLineCount();

      const startLine = Math.max(1, currentLine - 30);
      const endLine = Math.min(lineCount, currentLine + 10);

      const prefixRange = {
        startLineNumber: startLine,
        startColumn: 1,
        endLineNumber: currentLine,
        endColumn: currentColumn,
      };

      const suffixRange = {
        startLineNumber: currentLine,
        startColumn: currentColumn,
        endLineNumber: endLine,
        endColumn: model.getLineMaxColumn(endLine),
      };

      const prefix = model.getValueInRange(prefixRange);
      const suffix = model.getValueInRange(suffixRange);

      if (!prefix || !prefix.trim()) {
        return { items: [] };
      }

      // 5. Create AbortController tied to Monaco CancellationToken
      activeAbortController = new AbortController();
      const signal = activeAbortController.signal;

      const onCancel = () => {
        if (activeAbortController) {
          activeAbortController.abort();
        }
      };
      token.onCancellationRequested(onCancel);

      try {
        const aiProvider = providerFactory.getProvider();
        const config = {
          ...aiConfigManager.getConfig(),
          model: settings.aiModel || aiConfigManager.getModel(),
          temperature: 0.2, // Low temperature for code completions
          maxTokens: 128,   // Keep completions concise
        };

        const promptData = inlineCompletionPrompt({
          prefix,
          suffix,
          language: model.getLanguageId(),
          filename: model.uri ? model.uri.path.split("/").pop() : "file",
        });

        const rawResult = await aiProvider.generateContent({
          prompt: promptData.prompt,
          systemInstruction: promptData.systemInstruction,
          config,
          signal,
        });

        if (!rawResult || token.isCancellationRequested) {
          return { items: [] };
        }

        // Clean up markdown wrapping if present
        let completionText = rawResult
          .replace(/^```[a-z]*\n?/i, "")
          .replace(/\n?```$/i, "")
          .trimEnd();

        // If completion text duplicates prefix end or is empty, return empty
        if (!completionText || completionText.trim() === "") {
          return { items: [] };
        }

        return {
          items: [
            {
              insertText: completionText,
              range: {
                startLineNumber: currentLine,
                startColumn: currentColumn,
                endLineNumber: currentLine,
                endColumn: currentColumn,
              },
            },
          ],
        };
      } catch (err) {
        // Handle failure silently without interrupting editing
        return { items: [] };
      } finally {
        activeAbortController = null;
      }
    },
    freeInlineCompletions: () => {},
  };

  supportedLanguages.forEach((lang) => {
    try {
      const disposable = monaco.languages.registerInlineCompletionsProvider(lang, provider);
      registeredDisposables.push(disposable);
    } catch (e) {
      console.warn(`[AIInlineCompletion] Failed to register provider for language ${lang}:`, e);
    }
  });
};

/**
 * Disposes active inline completion providers.
 */
export const disposeAIInlineCompletionProvider = () => {
  registeredDisposables.forEach((d) => {
    try {
      d.dispose();
    } catch {}
  });
  registeredDisposables = [];
};

export default {
  registerAIInlineCompletionProvider,
  disposeAIInlineCompletionProvider,
};
