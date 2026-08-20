/**
 * Server Collaboration Utilities for Pix / PixelIDE (Sprint 15)
 * Helper functions for room IDs, input sanitization, deterministic colors, and payload validation.
 */

// Palette of distinct, readable colors for remote user cursors & presence avatars
const COLLAB_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#84CC16", // Lime
  "#6366F1", // Indigo
  "#E11D48", // Rose
];

/**
 * Returns a deterministic color for a given socket or user ID.
 * @param {string} id - Socket ID or User ID
 * @returns {string} Hex color string
 */
export const getDeterministicColor = (id = "") => {
  if (!id) return COLLAB_COLORS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COLLAB_COLORS.length;
  return COLLAB_COLORS[index];
};

/**
 * Sanitizes project or room ID.
 * @param {string} rawId
 * @returns {string} Cleaned room ID
 */
export const sanitizeRoomId = (rawId = "") => {
  if (!rawId || typeof rawId !== "string") return "default-project";
  return rawId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "default-project";
};

/**
 * Sanitizes user display name.
 * @param {string} rawName
 * @returns {string} Cleaned display name
 */
export const sanitizeUsername = (rawName = "") => {
  if (!rawName || typeof rawName !== "string") return "Anonymous Dev";
  const cleaned = rawName.trim().replace(/[\langle\rangle]/g, "").slice(0, 32);
  return cleaned || "Anonymous Dev";
};

/**
 * Sanitizes chat message text.
 * @param {string} rawMessage
 * @returns {string} Cleaned message text
 */
export const sanitizeChatMessage = (rawMessage = "") => {
  if (!rawMessage || typeof rawMessage !== "string") return "";
  return rawMessage.trim().slice(0, 500);
};

export default {
  COLLAB_COLORS,
  getDeterministicColor,
  sanitizeRoomId,
  sanitizeUsername,
  sanitizeChatMessage,
};
