/**
 * PixelIDE Gemini AI Provider Implementation
 * Integrates directly with Google Gemini REST API using fetch with AbortSignal & Timeout support,
 * with fallback to local Express server proxy (http://localhost:5000/api/ai/generate).
 */

import BaseAIProvider from "./BaseAIProvider";
import { AIError, AIErrorType } from "../errors/aiErrors";

export class GeminiProvider extends BaseAIProvider {
  constructor() {
    super("gemini");
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
    this.serverProxyUrl = "http://localhost:5000/api/ai/generate";
  }

  /**
   * Generates content via Gemini REST API or Express server proxy.
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

    const rawKey = config.apiKey || "";
    const apiKey = String(rawKey).replace(/^["']|["']$/g, "").trim();

    const model = config.model || "gemini-1.5-flash";
    const temperature = config.temperature !== undefined ? config.temperature : 0.7;
    const maxOutputTokens = config.maxTokens || 4096;
    const timeoutMs = config.timeoutMs || 30000;

    // 1. Try Direct Gemini REST API request if apiKey exists
    if (apiKey) {
      try {
        return await this._callDirectGemini({
          prompt,
          systemInstruction,
          apiKey,
          model,
          temperature,
          maxOutputTokens,
          timeoutMs,
          signal,
        });
      } catch (err) {
        // If cancellation or invalid key, throw immediately
        if (
          err.type === AIErrorType.CANCELLED ||
          err.type === AIErrorType.INVALID_API_KEY
        ) {
          throw err;
        }
        // Fallthrough to server proxy attempt
      }
    }

    // 2. Fallback to Express Proxy (http://localhost:5000/api/ai/generate)
    try {
      return await this._callServerProxy({
        prompt,
        systemInstruction,
        apiKey,
        model,
        temperature,
        maxOutputTokens,
        timeoutMs,
        signal,
      });
    } catch (proxyErr) {
      if (proxyErr instanceof AIError) throw proxyErr;

      if (!apiKey) {
        throw new AIError(
          AIErrorType.MISSING_API_KEY,
          "VITE_GEMINI_API_KEY is missing. Please set your API Key in .env or configure server process.env.GEMINI_API_KEY."
        );
      }

      throw proxyErr;
    }
  }

  /**
   * Internal direct call to Google Gemini REST API.
   */
  async _callDirectGemini({
    prompt,
    systemInstruction,
    apiKey,
    model,
    temperature,
    maxOutputTokens,
    timeoutMs,
    signal,
  }) {
    const endpoint = `${this.baseUrl}/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: timeoutController.signal,
      });

      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onAbort);

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch (_) {}

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
      const candidate = data.candidates?.[0];
      const parts = candidate?.content?.parts;

      if (!parts || !parts.length || !parts[0].text) {
        throw new AIError(
          AIErrorType.MALFORMED_RESPONSE,
          "Gemini API returned an empty text payload."
        );
      }

      return parts[0].text.trim();
    } catch (err) {
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onAbort);

      if (err instanceof AIError) throw err;

      if (err.name === "AbortError" || signal?.aborted) {
        if (timeoutController.signal.reason?.message === "Timeout") {
          throw new AIError(AIErrorType.TIMEOUT, `Request timed out after ${timeoutMs}ms.`);
        }
        throw new AIError(AIErrorType.CANCELLED);
      }

      throw new AIError(AIErrorType.NETWORK_ERROR, err.message, err);
    }
  }

  /**
   * Internal call to local Express server proxy (/api/ai/generate).
   */
  async _callServerProxy({
    prompt,
    systemInstruction,
    apiKey,
    model,
    temperature,
    maxOutputTokens,
    timeoutMs,
    signal,
  }) {
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
      const response = await fetch(this.serverProxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-gemini-api-key": apiKey } : {}),
        },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          model,
          temperature,
          maxTokens: maxOutputTokens,
        }),
        signal: timeoutController.signal,
      });

      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onAbort);

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new AIError(
            AIErrorType.INVALID_API_KEY,
            data.details || data.error || "Invalid API key provided."
          );
        }
        throw new AIError(
          AIErrorType.PROVIDER_ERROR,
          data.details || data.error || "Server proxy AI execution failed."
        );
      }

      if (!data.text) {
        throw new AIError(
          AIErrorType.MALFORMED_RESPONSE,
          "Server AI proxy returned an empty response."
        );
      }

      return data.text.trim();
    } catch (err) {
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onAbort);

      if (err instanceof AIError) throw err;

      if (err.name === "AbortError" || signal?.aborted) {
        if (timeoutController.signal.reason?.message === "Timeout") {
          throw new AIError(AIErrorType.TIMEOUT, `Request timed out after ${timeoutMs}ms.`);
        }
        throw new AIError(AIErrorType.CANCELLED);
      }

      throw new AIError(AIErrorType.NETWORK_ERROR, err.message, err);
    }
  }
}

export default GeminiProvider;
