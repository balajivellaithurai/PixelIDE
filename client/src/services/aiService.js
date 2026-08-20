/**
 * PixelIDE Public AI Service Facade (Sprint 10 - Context-Aware & Intelligent Debugger)
 * Provides asynchronous methods for all AI features.
 * Connects prompt generators, Zustand AI store, AI Context Builder, and real AI providers.
 * Enforces caching, deduplication, retry with context reuse, and error handling.
 */

import useAIStore, { AIActionType } from "../store/aiStore";
import providerFactory from "../ai/providers/AIProviderFactory";
import aiConfigManager from "../ai/config/aiConfig";
import { AIError, AIErrorType } from "../ai/errors/aiErrors";
import buildAIContext from "./aiContextBuilder";
import gitService from "./gitService";
import {
  reviewPrompt,
  debugPrompt,
  explainPrompt,
  optimizePrompt,
  testsPrompt,
  documentationPrompt,
  interviewPrompt,
  refactorPrompt,
  fixBugPrompt,
  commitMessagePrompt,
  workspaceSummaryPrompt,
  chatPrompt,
  functionExplainPrompt,
  commentsPrompt,
  readmePrompt,
} from "../ai/prompts/promptTemplates";
import detectEnclosingFunction from "./functionDetector";

// Response cache map: cacheKey -> { responseText, metadata, timestamp }
const contextCache = new Map();

class AIService {
  /**
   * Generates a deterministic cache key from an AI Context object.
   */
  _getCacheKey(context) {
    return [
      context.action,
      context.language,
      context.filename,
      context.selectedCode || "",
      context.sourceCode || "",
      context.stderr || "",
      context.compileOutput || "",
      context.consoleOutput || "",
      context.stagedDiff || "",
    ].join("::");
  }

  /**
   * Internal helper to execute AI operations across providers, store, and prompts.
   */
  async _executeAction(actionType, context, promptGenerator) {
    const startTime = performance.now();

    // 1. Guard against empty source code input
    const bypassEmptyCheck = [
      AIActionType.INTERVIEW,
      AIActionType.COMMIT_MESSAGE,
      AIActionType.PROJECT_SUMMARY,
      AIActionType.CHAT,
    ].includes(actionType);

    if (!bypassEmptyCheck && (!context.sourceCode || !context.sourceCode.trim())) {
      const emptyError = new AIError(
        AIErrorType.EMPTY_REQUEST,
        "Start writing code before using AI."
      );
      useAIStore.getState().setError(null, emptyError);
      throw emptyError;
    }

    // 2. Check Cache for Identical Context
    const cacheKey = this._getCacheKey(context);
    if (contextCache.has(cacheKey)) {
      console.log(`[AIService Cache Hit] Returning cached response for action: ${actionType}`);
      const cached = contextCache.get(cacheKey);

      const { startAction, setResponse } = useAIStore.getState();
      const { requestId } = startAction(actionType, { actionType, context });

      setResponse(requestId, cached.responseText, {
        context,
        durationMs: 50, // instant from cache
        estimatedTokens: cached.estimatedTokens,
        fromCache: true,
      });

      return cached.responseText;
    }

    // 3. Prompt Generation
    const promptData = promptGenerator(context);

    // 4. Initialize Store Action State
    const { startAction, setResponse, setError } = useAIStore.getState();
    const { requestId, signal } = startAction(actionType, {
      actionType,
      context,
      promptData,
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

      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);
      const estimatedTokens = Math.ceil(responseText.length / 4);

      // Save to Cache
      contextCache.set(cacheKey, {
        responseText,
        estimatedTokens,
        timestamp: Date.now(),
      });

      // Update Store
      setResponse(requestId, responseText, {
        context,
        durationMs,
        estimatedTokens,
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
   * @param {Object} [overrides={}] - Optional context overrides
   */
  async reviewCode(overrides = {}) {
    const context = buildAIContext(AIActionType.REVIEW, overrides);
    return this._executeAction(AIActionType.REVIEW, context, reviewPrompt);
  }

  /**
   * Performs AI Error Debugging using Judge0 & Compiler output.
   * @param {Object} [overrides={}] - Optional context overrides
   */
  async debugError(overrides = {}) {
    const context = buildAIContext(AIActionType.DEBUG, overrides);
    return this._executeAction(AIActionType.DEBUG, context, debugPrompt);
  }

  /**
   * Explains full file code or highlighted text selection.
   * @param {Object} [overrides={}] - Optional context overrides
   */
  async explainSelection(overrides = {}) {
    const context = buildAIContext(AIActionType.EXPLAIN, overrides);
    return this._executeAction(AIActionType.EXPLAIN, context, explainPrompt);
  }

  /**
   * Optimizes code for time/space performance.
   * @param {Object} [overrides={}] - Optional context overrides
   */
  async optimizeCode(overrides = {}) {
    const context = buildAIContext(AIActionType.OPTIMIZE, overrides);
    return this._executeAction(AIActionType.OPTIMIZE, context, optimizePrompt);
  }

  /**
   * Generates unit tests for code.
   * @param {Object} [overrides={}] - Optional context overrides
   */
  async generateTests(overrides = {}) {
    const context = buildAIContext(AIActionType.TESTS, overrides);
    return this._executeAction(AIActionType.TESTS, context, testsPrompt);
  }

  /**
   * Generates technical documentation & docstrings.
   * @param {Object} [overrides={}] - Optional context overrides
   */
  async generateDocs(overrides = {}) {
    const context = buildAIContext(AIActionType.DOCS, overrides);
    return this._executeAction(AIActionType.DOCS, context, documentationPrompt);
  }

  /**
   * Evaluates code for Technical Interview Mode.
   * @param {Object} [overrides={}] - Optional context overrides
   */
  async interviewFeedback(overrides = {}) {
    const context = buildAIContext(AIActionType.INTERVIEW, overrides);
    return this._executeAction(AIActionType.INTERVIEW, context, interviewPrompt);
  }

  /**
   * Explains current function surrounding cursor or highlighted text.
   * @param {Object} [overrides={}] - Optional context overrides
   */
  async explainFunction(overrides = {}) {
    const context = buildAIContext(AIActionType.EXPLAIN, overrides);
    const { sourceCode, cursorLine, language, filename, selectedCode } = context;

    useAIStore.getState().openSidebar();

    if (selectedCode && selectedCode.trim()) {
      return this._executeAction(AIActionType.EXPLAIN, context, explainPrompt);
    }

    const funcDetails = detectEnclosingFunction(sourceCode, cursorLine, language);
    const funcContext = {
      ...context,
      functionCode: funcDetails.code,
      functionName: funcDetails.name,
      filename,
      language,
    };

    return this._executeAction(AIActionType.EXPLAIN, funcContext, functionExplainPrompt);
  }

  /**
   * Generates documentation comments for code and triggers preview modal.
   * @param {Object} [overrides={}] - Optional context overrides
   */
  async generateComments(overrides = {}) {
    const context = buildAIContext(AIActionType.DOCS, overrides);
    const { sourceCode, selectedCode, cursorLine, language, filename } = context;

    let targetCode = selectedCode && selectedCode.trim() ? selectedCode : "";
    if (!targetCode) {
      const funcDetails = detectEnclosingFunction(sourceCode, cursorLine, language);
      targetCode = funcDetails.code || sourceCode;
    }

    const responseText = await this._executeAction(
      AIActionType.DOCS,
      { ...context, targetCode },
      commentsPrompt
    );

    // Extract commented code block from response
    const codeMatch = responseText.match(/```[a-z]*\n([\s\S]*?)\n```/i);
    const commentedCode = codeMatch ? codeMatch[1].trim() : responseText;

    useAIStore.getState().openCommentModal({
      originalCode: targetCode,
      commentedCode,
      filename,
      language,
      fullSource: sourceCode,
      isSelection: Boolean(selectedCode && selectedCode.trim()),
    });

    return responseText;
  }

  /**
   * Refactors code and presents Monaco Diff Editor preview for user approval.
   * @param {Object} [overrides={}] - Optional context overrides
   */
  async refactorCodeWithDiff(overrides = {}) {
    const context = buildAIContext(AIActionType.REFACTOR, overrides);
    const { sourceCode, filename, language } = context;

    const responseText = await this._executeAction(AIActionType.REFACTOR, context, refactorPrompt);

    // Extract refactored code block
    let refactoredCode = "";
    const refactoredSectionMatch = responseText.match(/## Refactored Code\s*```[a-z]*\n([\s\S]*?)\n```/i);
    if (refactoredSectionMatch) {
      refactoredCode = refactoredSectionMatch[1].trim();
    } else {
      const codeMatches = [...responseText.matchAll(/```[a-z]*\n([\s\S]*?)\n```/gi)];
      if (codeMatches.length > 0) {
        refactoredCode = codeMatches[codeMatches.length - 1][1].trim();
      } else {
        refactoredCode = responseText;
      }
    }

    useAIStore.getState().openRefactorModal({
      originalCode: sourceCode,
      refactoredCode,
      filename,
      language,
    });

    return responseText;
  }

  /**
   * Analyzes workspace and generates professional README.md with preview modal.
   * @param {Object} [overrides={}] - Optional context overrides
   */
  async generateReadme(overrides = {}) {
    const context = buildAIContext(AIActionType.PROJECT_SUMMARY, overrides);
    const responseText = await this._executeAction(AIActionType.PROJECT_SUMMARY, context, readmePrompt);

    // Clean up code block if wrapped
    const cleanedReadme = responseText
      .replace(/^```markdown\n/i, "")
      .replace(/^```md\n/i, "")
      .replace(/\n```$/i, "");

    useAIStore.getState().openReadmeModal({
      content: cleanedReadme,
      repoName: context.filename ? context.filename.split(".")[0] : "Pix Project",
    });

    return cleanedReadme;
  }

  /**
   * Refactors code for readability, architecture, and naming.
   * @param {Object} [overrides={}] - Optional context overrides
   */
  async refactorCode(overrides = {}) {
    return this.refactorCodeWithDiff(overrides);
  }

  /**
   * Identifies bugs and generates corrected code with explanations.
   * @param {Object} [overrides={}] - Optional context overrides
   */
  async fixBug(overrides = {}) {
    const context = buildAIContext(AIActionType.FIX_BUG, overrides);
    return this._executeAction(AIActionType.FIX_BUG, context, fixBugPrompt);
  }

  /**
   * Analyzes workspace changes and generates Conventional Commit messages.
   * @param {Object} [overrides={}] - Optional context overrides
   */
  async generateCommitMessage(overrides = {}) {
    let stagedDiff = "";
    try {
      const diffRes = await gitService.getStagedDiff();
      stagedDiff = diffRes?.diff || "";
    } catch (e) {
      console.warn("[AIService] Failed to fetch staged diff for commit message generation:", e);
    }
    const context = buildAIContext(AIActionType.COMMIT_MESSAGE, { stagedDiff, ...overrides });
    return this._executeAction(AIActionType.COMMIT_MESSAGE, context, commitMessagePrompt);
  }

  /**
   * Generates a 1-click executive Workspace Project Summary.
   * @param {Object} [overrides={}] - Optional context overrides
   */
  async summarizeWorkspace(overrides = {}) {
    const context = buildAIContext(AIActionType.PROJECT_SUMMARY, overrides);
    return this._executeAction(AIActionType.PROJECT_SUMMARY, context, workspaceSummaryPrompt);
  }

  /**
   * Sends a user message to the AI Workspace Chat with full workspace context.
   * @param {string} userText - User chat prompt message
   */
  async sendChatMessage(userText) {
    if (!userText || !userText.trim()) return;

    const { addChatMessage, setChatLoading, setError, chatHistory } = useAIStore.getState();
    addChatMessage("user", userText);
    setChatLoading(true);

    const context = buildAIContext(AIActionType.CHAT);
    const promptData = chatPrompt(chatHistory, context);

    try {
      const provider = providerFactory.getProvider();
      const config = aiConfigManager.getConfig();

      const responseText = await provider.generateContent({
        prompt: promptData.prompt,
        systemInstruction: promptData.systemInstruction,
        config,
      });

      addChatMessage("ai", responseText);
      setChatLoading(false);
      return responseText;
    } catch (err) {
      setChatLoading(false);
      const aiError =
        err instanceof AIError
          ? err
          : new AIError(AIErrorType.UNKNOWN_ERROR, err.message, err);

      setError(null, aiError);
      throw aiError;
    }
  }

  /**
   * Retries the previous AI request reusing the previous AI context.
   */
  async retryLastRequest() {
    const { lastContext } = useAIStore.getState();
    if (!lastContext) {
      console.warn("No prior AI context available for retry.");
      return;
    }

    const actionPromptMap = {
      [AIActionType.REVIEW]: reviewPrompt,
      [AIActionType.DEBUG]: debugPrompt,
      [AIActionType.EXPLAIN]: explainPrompt,
      [AIActionType.OPTIMIZE]: optimizePrompt,
      [AIActionType.TESTS]: testsPrompt,
      [AIActionType.DOCS]: documentationPrompt,
      [AIActionType.REFACTOR]: refactorPrompt,
      [AIActionType.FIX_BUG]: fixBugPrompt,
      [AIActionType.COMMIT_MESSAGE]: commitMessagePrompt,
      [AIActionType.PROJECT_SUMMARY]: workspaceSummaryPrompt,
      [AIActionType.INTERVIEW]: interviewPrompt,
    };

    const promptGenerator = actionPromptMap[lastContext.action] || reviewPrompt;
    return this._executeAction(lastContext.action, lastContext, promptGenerator);
  }

  /**
   * Clears the response cache.
   */
  clearCache() {
    contextCache.clear();
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
