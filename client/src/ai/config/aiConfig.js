/**
 * PixelIDE AI Configuration Management
 * Resolves configuration settings from environment variables (Vite import.meta.env)
 * with robust fallback defaults.
 */

const getEnv = (key, fallback) => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] !== undefined ? import.meta.env[key] : fallback;
  }
  return fallback;
};

export const AI_PROVIDERS = {
  GEMINI: "gemini",
  OPENAI: "openai",
  CLAUDE: "claude",
  GROQ: "groq",
  OLLAMA: "ollama",
  AZURE: "azure",
  MISTRAL: "mistral",
};

export const DEFAULT_AI_CONFIG = {
  provider: getEnv("VITE_AI_PROVIDER", AI_PROVIDERS.GEMINI),
  apiKey: getEnv("VITE_GEMINI_API_KEY", ""),
  model: getEnv("VITE_AI_MODEL", "gemini-1.5-flash"),
  temperature: parseFloat(getEnv("VITE_AI_TEMPERATURE", "0.7")),
  timeoutMs: parseInt(getEnv("VITE_AI_TIMEOUT_MS", "30000"), 10),
  maxTokens: 4096,
};

class AIConfigManager {
  constructor() {
    this.config = { ...DEFAULT_AI_CONFIG };
  }

  getConfig() {
    return { ...this.config };
  }

  updateConfig(updates = {}) {
    this.config = {
      ...this.config,
      ...updates,
    };
    return this.getConfig();
  }

  getApiKey() {
    return this.config.apiKey || getEnv("VITE_GEMINI_API_KEY", "");
  }

  getProvider() {
    return this.config.provider;
  }

  getModel() {
    return this.config.model;
  }

  getTemperature() {
    return this.config.temperature;
  }

  getTimeoutMs() {
    return this.config.timeoutMs;
  }
}

export const aiConfigManager = new AIConfigManager();
export default aiConfigManager;
