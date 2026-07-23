/**
 * PixelIDE AI Error Definitions & Custom Error Class
 * Standardizes errors across AI services, stores, and providers.
 */

export const AIErrorType = {
  MISSING_API_KEY: "MISSING_API_KEY",
  INVALID_API_KEY: "INVALID_API_KEY",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  RATE_LIMIT: "RATE_LIMIT",
  MALFORMED_RESPONSE: "MALFORMED_RESPONSE",
  PROVIDER_ERROR: "PROVIDER_ERROR",
  EMPTY_REQUEST: "EMPTY_REQUEST",
  CANCELLED: "CANCELLED",
  UNEXPECTED_JSON: "UNEXPECTED_JSON",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

export const AIErrorMessages = {
  [AIErrorType.MISSING_API_KEY]:
    "Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your environment configuration.",
  [AIErrorType.INVALID_API_KEY]:
    "Invalid API Key. Please verify your API credentials in your environment configuration.",
  [AIErrorType.NETWORK_ERROR]:
    "Network failure encountered while connecting to AI provider. Please check your internet connection.",
  [AIErrorType.TIMEOUT]:
    "AI request timed out. The AI provider did not respond within the allocated timeframe.",
  [AIErrorType.RATE_LIMIT]:
    "API rate limit exceeded. Please wait a moment before trying again.",
  [AIErrorType.MALFORMED_RESPONSE]:
    "Received an invalid or malformed response structure from the AI provider.",
  [AIErrorType.PROVIDER_ERROR]:
    "The AI provider returned an internal service error.",
  [AIErrorType.EMPTY_REQUEST]:
    "Cannot process empty prompt or code input.",
  [AIErrorType.CANCELLED]:
    "AI operation was cancelled by user action.",
  [AIErrorType.UNEXPECTED_JSON]:
    "Failed to parse expected JSON output from AI response.",
  [AIErrorType.UNKNOWN_ERROR]:
    "An unexpected error occurred during AI operation execution.",
};

export class AIError extends Error {
  constructor(type, customDetails = null, rawError = null) {
    const message = AIErrorMessages[type] || AIErrorMessages[AIErrorType.UNKNOWN_ERROR];
    super(message);
    this.name = "AIError";
    this.type = type;
    this.details = customDetails;
    this.rawError = rawError;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}
