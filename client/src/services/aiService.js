/**
 * PixelIDE Public AI Service Facade (Sprint 9 - Real Gemini AI Integration)
 * Provides asynchronous methods for all AI features.
 * Connects prompt generators, Zustand AI store, and real AI providers.
 * Components NEVER call Gemini or external AI APIs directly.
 */

import useAIStore, { AIActionType } from "../store/aiStore";
import providerFactory from "../ai/providers/AIProviderFactory";
import aiConfigManager from "../ai/config/aiConfig";
import { AIError, AIErrorType } from "../ai/errors/aiErrors";
import {
  reviewPrompt,
  debugPrompt,
  explainPrompt,
  optimizePrompt,
  testsPrompt,
  documentationPrompt,
  interviewPrompt,
} from "../ai/prompts/promptTemplates";

class AIService {
  /**
   * Internal helper to execute AI operations across providers, store, and prompts.
   */
  async _executeAction(actionType, promptData, meta = {}) {
    // 1. Guard against empty editor requests
    const targetCode = meta.code || "";
    if (actionType !== AIActionType.INTERVIEW && (!targetCode || !targetCode.trim())) {
      const emptyError = new AIError(
        AIErrorType.EMPTY_REQUEST,
        "Start writing code before using AI."
      );
      useAIStore.getState().setError(null, emptyError);
      throw emptyError;
    }

    const { startAction, setResponse, setError } = useAIStore.getState();
    const { requestId, signal } = startAction(actionType, {
      actionType,
      promptData,
      meta,
    });

    try {
      const provider = providerFactory.getProvider();
      const config = aiConfigManager.getConfig();

      const responseText = await provider.generateContent({
        prompt: promptData.prompt,
        systemInstruction: promptData.systemInstruction,
        config,
        signal,
      });

      setResponse(requestId, responseText, {
        language: meta.language || "javascript",
        actionType,
        ...meta,
      });

      return responseText;
    } catch (err) {
      const aiError =
        err instanceof AIError
          ? err
          : new AIError(AIErrorType.UNKNOWN_ERROR, err.message, err);

      setError(requestId, aiError);
      throw aiError;
    }
  }

  /**
   * Performs real AI Code Review.
   * @param {string} code - Source code to review
   * @param {string} [language='javascript'] - Programming language
   */
  async reviewCode(code, language = "javascript") {
    const promptData = reviewPrompt({ code, language });
    return this._executeAction(AIActionType.REVIEW, promptData, { code, language });
  }

  /**
   * Performs real AI Error Debugging.
   * @param {string} code - Source code
   * @param {string} [language='javascript'] - Programming language
   * @param {string} [errorOutput=''] - Console or compiler error text
   */
  async debugError(code, language = "javascript", errorOutput = "") {
    const promptData = debugPrompt({ code, language, errorOutput });
    return this._executeAction(AIActionType.DEBUG, promptData, { code, language, errorOutput });
  }

  /**
   * Explains full file code or highlighted text selection.
   * @param {string} code - Source code
   * @param {string} [language='javascript'] - Programming language
   * @param {string} [selectedText=''] - Highlighted selection snippet
   */
  async explainSelection(code, language = "javascript", selectedText = "") {
    const promptData = explainPrompt({ code, language, selectedText });
    return this._executeAction(AIActionType.EXPLAIN, promptData, { code, language, selectedText });
  }

  /**
   * Optimizes code for time/space performance.
   * @param {string} code - Source code
   * @param {string} [language='javascript'] - Programming language
   */
  async optimizeCode(code, language = "javascript") {
    const promptData = optimizePrompt({ code, language });
    return this._executeAction(AIActionType.OPTIMIZE, promptData, { code, language });
  }

  /**
   * Generates unit tests for code.
   * @param {string} code - Source code
   * @param {string} [language='javascript'] - Programming language
   */
  async generateTests(code, language = "javascript") {
    const promptData = testsPrompt({ code, language });
    return this._executeAction(AIActionType.TESTS, promptData, { code, language });
  }

  /**
   * Generates technical documentation & docstrings.
   * @param {string} code - Source code
   * @param {string} [language='javascript'] - Programming language
   */
  async generateDocs(code, language = "javascript") {
    const promptData = documentationPrompt({ code, language });
    return this._executeAction(AIActionType.DOCS, promptData, { code, language });
  }

  /**
   * Evaluates code for Technical Interview Mode.
   * @param {string} code - Solution code
   * @param {string} [language='javascript'] - Programming language
   * @param {string} [problemStatement='Coding Challenge'] - Problem description
   * @param {string} [userQuestion=''] - Candidate message
   */
  async interviewFeedback(
    code,
    language = "javascript",
    problemStatement = "Coding Challenge",
    userQuestion = ""
  ) {
    const promptData = interviewPrompt({
      code,
      language,
      problemStatement,
      userQuestion,
    });
    return this._executeAction(AIActionType.INTERVIEW, promptData, {
      code,
      language,
      problemStatement,
      userQuestion,
    });
  }

  /**
   * Retries the previous AI request.
   */
  async retryLastRequest() {
    const lastRequest = useAIStore.getState().lastRequest;
    if (!lastRequest) return;
    return this._executeAction(
      lastRequest.actionType,
      lastRequest.promptData,
      lastRequest.meta
    );
  }

  /**
   * Cancels active ongoing AI operation.
   */
  cancelRequest() {
    useAIStore.getState().cancelAction();
  }
}

export const aiService = new AIService();
export default aiService;
