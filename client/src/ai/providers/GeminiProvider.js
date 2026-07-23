/**
 * PixelIDE Gemini AI Provider Implementation
 * Integrates directly with Google Gemini REST API using fetch with AbortSignal & Timeout support.
 */

import BaseAIProvider from "./BaseAIProvider";
import { AIError, AIErrorType } from "../errors/aiErrors";

export class GeminiProvider extends BaseAIProvider {
  constructor() {
    super("gemini");
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
  }

  /**
   * Generates content via Gemini REST API.
   *
   * @param {Object} params
   * @param {string} params.prompt - User or assembled prompt text
   * @param {string} [params.systemInstruction] - System level instructions
   * @param {Object} [params.config] - Runtime provider options (apiKey, model, temperature, timeoutMs)
   * @param {AbortSignal} [params.signal] - Abort controller signal for cancellation
   * @returns {Promise<string>} Cleaned text response from Gemini API
   */
  async generateContent({ prompt, systemInstruction, config = {}, signal }) {
    if (!prompt || !prompt.trim()) {
      throw new AIError(AIErrorType.EMPTY_REQUEST, "Prompt content cannot be empty.");
    }

    const apiKey = config.apiKey;
    if (!apiKey) {
      throw new AIError(
        AIErrorType.MISSING_API_KEY,
        "VITE_GEMINI_API_KEY is not configured."
      );
    }

    const model = config.model || "gemini-1.5-flash";
    const temperature = config.temperature !== undefined ? config.temperature : 0.7;
    const maxOutputTokens = config.maxTokens || 4096;
    const timeoutMs = config.timeoutMs || 30000;

    const endpoint = `${this.baseUrl}/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens,
      },
    };

    if (systemInstruction && systemInstruction.trim()) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    // Set up timeout controller combined with caller's signal
    const timeoutController = new AbortController();
    const timer = setTimeout(() => {
      timeoutController.abort(new Error("Timeout"));
    }, timeoutMs);

    const onAbort = () => timeoutController.abort(new Error("Cancelled"));
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timer);
        throw new AIError(AIErrorType.CANCELLED);
      }
      signal.addEventListener("abort", onAbort);
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: timeoutController.signal,
      });

      clearTimeout(timer);
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch (_) {
          // Ignore JSON parse failure on non-200 error response
        }

        const statusCode = response.status;
        const statusMessage = errorData?.error?.message || response.statusText;

        if (statusCode === 401 || statusCode === 403) {
          throw new AIError(AIErrorType.INVALID_API_KEY, statusMessage, errorData);
        } else if (statusCode === 429) {
          throw new AIError(AIErrorType.RATE_LIMIT, statusMessage, errorData);
        } else if (statusCode >= 500) {
          throw new AIError(AIErrorType.PROVIDER_ERROR, statusMessage, errorData);
        } else {
          throw new AIError(
            AIErrorType.PROVIDER_ERROR,
            `Gemini API request failed with status ${statusCode}: ${statusMessage}`,
            errorData
          );
        }
      }

      const data = await response.json();

      // Extract generated text content safely
      const candidate = data.candidates?.[0];
      const parts = candidate?.content?.parts;
      if (!parts || !parts.length || !parts[0].text) {
        if (candidate?.finishReason && candidate.finishReason !== "STOP") {
          throw new AIError(
            AIErrorType.MALFORMED_RESPONSE,
            `Gemini API generation finished with reason: ${candidate.finishReason}`
          );
        }
        throw new AIError(
          AIErrorType.MALFORMED_RESPONSE,
          "Gemini API returned an empty or unparseable candidates payload."
        );
      }

      return parts[0].text.trim();
    } catch (err) {
      clearTimeout(timer);
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }

      if (err instanceof AIError) {
        throw err;
      }

      if (err.name === "AbortError" || signal?.aborted) {
        if (timeoutController.signal.reason?.message === "Timeout") {
          throw new AIError(AIErrorType.TIMEOUT, `Request timed out after ${timeoutMs}ms.`);
        }
        throw new AIError(AIErrorType.CANCELLED);
      }

      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        throw new AIError(AIErrorType.NETWORK_ERROR, err.message, err);
      }

      throw new AIError(AIErrorType.UNKNOWN_ERROR, err.message, err);
    }
  }
}

export default GeminiProvider;
