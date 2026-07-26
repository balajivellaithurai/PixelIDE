/**
 * AI Context Builder Service for Pix / PixelIDE (Sprint 10)
 * Unifies buildWorkspaceContext and buildAIContext as foundational context providers.
 */

import buildWorkspaceContext from "./workspaceContextBuilder";

export { buildWorkspaceContext };

export const buildAIContext = (action = "CUSTOM", overrides = {}) => {
  return buildWorkspaceContext(action, overrides);
};

export default buildAIContext;
