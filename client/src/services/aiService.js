/**
 * PixelIDE Public AI Service Facade
 * Provides high-level asynchronous methods for all AI features.
 * Connects prompt generators, Zustand AI store, and AI providers.
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
    const { startAction, setResponse, setError } = useAIStore.getState();
    const { requestId, signal } = startAction(actionType);

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
   * Performs AI Code Review.
   * @param {string} code - Source code to review
   * @param {string} [language='javascript'] - Programming language
   * @returns {Promise<string>} Review feedback
   */
  async reviewCode(code, language = "javascript") {
    if (!code || !code.trim()) {
      throw new AIError(AIErrorType.EMPTY_REQUEST, "Source code cannot be empty for review.");
    }
    const promptData = reviewPrompt({ code, language });
    return this._executeAction(AIActionType.REVIEW, promptData, { language });
  }

  /**
   * Performs AI Error Debugging.
   * @param {string} code - Source code
   * @param {string} [language='javascript'] - Programming language
   * @param {string} [errorOutput=''] - Console or compiler error text
   * @returns {Promise<string>} Debug analysis & fix
   */
  async debugError(code, language = "javascript", errorOutput = "") {
    if (!code || !code.trim()) {
      throw new AIError(AIErrorType.EMPTY_REQUEST, "Source code cannot be empty for debugging.");
    }
    const promptData = debugPrompt({ code, language, errorOutput });
    return this._executeAction(AIActionType.DEBUG, promptData, { language, errorOutput });
  }

  /**
   * Explains full file code or highlighted text selection.
   * @param {string} code - Source code
   * @param {string} [language='javascript'] - Programming language
   * @param {string} [selectedText=''] - Highlighted selection snippet
   * @returns {Promise<string>} Step-by-step code explanation
   */
  async explainSelection(code, language = "javascript", selectedText = "") {
    const target = selectedText && selectedText.trim() ? selectedText : code;
    if (!target || !target.trim()) {
      throw new AIError(AIErrorType.EMPTY_REQUEST, "No code provided to explain.");
    }
    const promptData = explainPrompt({ code, language, selectedText });
    return this._executeAction(AIActionType.EXPLAIN, promptData, { language, selectedText });
  }

  /**
   * Optimizes code for time/space performance.
   * @param {string} code - Source code
   * @param {string} [language='javascript'] - Programming language
   * @returns {Promise<string>} Optimized code and analysis
   */
  async optimizeCode(code, language = "javascript") {
    if (!code || !code.trim()) {
      throw new AIError(AIErrorType.EMPTY_REQUEST, "Source code cannot be empty for optimization.");
    }
    const promptData = optimizePrompt({ code, language });
    return this._executeAction(AIActionType.OPTIMIZE, promptData, { language });
  }

  /**
   * Generates unit tests for code.
   * @param {string} code - Source code
   * @param {string} [language='javascript'] - Programming language
   * @returns {Promise<string>} Unit test suite code
   */
  async generateTests(code, language = "javascript") {
    if (!code || !code.trim()) {
      throw new AIError(AIErrorType.EMPTY_REQUEST, "Source code cannot be empty for test generation.");
    }
    const promptData = testsPrompt({ code, language });
    return this._executeAction(AIActionType.TESTS, promptData, { language });
  }

  /**
   * Generates technical documentation & docstrings.
   * @param {string} code - Source code
   * @param {string} [language='javascript'] - Programming language
   * @returns {Promise<string>} Documentation markdown
   */
  async generateDocs(code, language = "javascript") {
    if (!code || !code.trim()) {
      throw new AIError(AIErrorType.EMPTY_REQUEST, "Source code cannot be empty for doc generation.");
    }
    const promptData = documentationPrompt({ code, language });
    return this._executeAction(AIActionType.DOCS, promptData, { language });
  }

  /**
   * Evaluates code for Interview Mode.
   * @param {string} code - Solution code
   * @param {string} [language='javascript'] - Programming language
   * @param {string} [problemStatement='Coding Challenge'] - Problem description
   * @param {string} [userQuestion=''] - Candidate message
   * @returns {Promise<string>} Interviewer feedback & hint
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
      language,
      problemStatement,
      userQuestion,
    });
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
