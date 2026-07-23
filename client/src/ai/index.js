/**
 * PixelIDE AI Foundation Barrel Export
 * Central entry point for all AI infrastructure elements.
 */

export { aiService, default as aiServiceDefault } from "../services/aiService";
export { default as useAIStore, AIActionType } from "../store/aiStore";
export { providerFactory } from "./providers/AIProviderFactory";
export { BaseAIProvider } from "./providers/BaseAIProvider";
export { GeminiProvider } from "./providers/GeminiProvider";
export { aiConfigManager, DEFAULT_AI_CONFIG, AI_PROVIDERS } from "./config/aiConfig";
export { AIError, AIErrorType, AIErrorMessages } from "./errors/aiErrors";
export {
  reviewPrompt,
  debugPrompt,
  explainPrompt,
  optimizePrompt,
  testsPrompt,
  documentationPrompt,
  interviewPrompt,
  SYSTEM_INSTRUCTIONS,
} from "./prompts/promptTemplates";
