/**
 * Client Collaboration Utilities for Pix / PixelIDE (Sprint 15)
 * Manages persistent local user identity, color assignment, and shareable link generator.
 */

const AVATAR_COLORS = [
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
 * Retrieves or generates a persistent local user identity stored in localStorage.
 * @returns {Object} { id, name, avatarColor }
 */
export const getLocalIdentity = () => {
  try {
    const saved = localStorage.getItem("pix_collab_identity");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id && parsed.name) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to read collaboration identity from localStorage:", e);
  }

  // Generate lightweight persistent identity for unauthenticated user
  const randomId = "user-" + Math.random().toString(36).substring(2, 9);
  const adjectives = ["Pixel", "Code", "Async", "Logic", "Cyber", "Dev", "Turbo", "Vector"];
  const nouns = ["Coder", "Hacker", "Builder", "Wizard", "Ninja", "Craft", "Master", "Pilot"];
  const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${
    nouns[Math.floor(Math.random() * nouns.length)]
  }`;
  const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const newIdentity = {
    id: randomId,
    name: randomName,
    avatarColor: randomColor,
  };

  try {
    localStorage.setItem("pix_collab_identity", JSON.stringify(newIdentity));
  } catch (e) {}

  return newIdentity;
};

/**
 * Saves updated local identity to localStorage.
 * @param {Object} updates - { name, avatarColor }
 */
export const saveLocalIdentity = (updates = {}) => {
  const current = getLocalIdentity();
  const updated = { ...current, ...updates };
  try {
    localStorage.setItem("pix_collab_identity", JSON.stringify(updated));
  } catch (e) {}
  return updated;
};

/**
 * Builds a shareable collaboration link for a project.
 * @param {string} projectId
 * @returns {string} Full URL string
 */
export const getShareableCollabUrl = (projectId = "default-project") => {
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
  return `${origin}/workspace?collab=${encodeURIComponent(projectId)}`;
};

export default {
  getLocalIdentity,
  saveLocalIdentity,
  getShareableCollabUrl,
  AVATAR_COLORS,
};
