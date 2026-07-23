/**
 * PixelIDE AI Provider Factory
 * Dynamically resolves and manages AI Provider instances.
 * Solves provider switching cleanly without leaking provider implementations to UI.
 */

import GeminiProvider from "./GeminiProvider";
import { AIError, AIErrorType } from "../errors/aiErrors";
import aiConfigManager, { AI_PROVIDERS } from "../config/aiConfig";

class AIProviderFactory {
  constructor() {
    this.providers = new Map();
    // Register default Gemini provider
    this.registerProvider(AI_PROVIDERS.GEMINI, new GeminiProvider());
  }

  /**
   * Registers a provider instance.
   * @param {string} providerName - Name identifier ('gemini', 'openai', 'claude', etc.)
   * @param {BaseAIProvider} providerInstance - Concrete provider instance
   */
  registerProvider(providerName, providerInstance) {
    if (!providerName || !providerInstance) return;
    this.providers.set(providerName.toLowerCase(), providerInstance);
  }

  /**
   * Resolves provider instance by name, falling back to configured environment provider.
   * @param {string} [name] - Target provider name
   * @returns {BaseAIProvider} Resolved provider instance
   */
  getProvider(name) {
    const targetName = (name || aiConfigManager.getProvider() || AI_PROVIDERS.GEMINI).toLowerCase();
    const provider = this.providers.get(targetName);

    if (!provider) {
      throw new AIError(
        AIErrorType.PROVIDER_ERROR,
        `AI Provider '${targetName}' is not registered or supported yet.`
      );
    }

    return provider;
  }

  /**
   * Checks if a provider name is registered.
   * @param {string} providerName
   * @returns {boolean}
   */
  hasProvider(providerName) {
    return this.providers.has((providerName || "").toLowerCase());
  }
}

export const providerFactory = new AIProviderFactory();
export default providerFactory;
