/**
 * Utility service for parsing, matching, and executing IDE keyboard shortcuts.
 */

export const isMac =
  typeof window !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

/**
 * Checks if a KeyboardEvent matches the expected shortcut configuration.
 *
 * @param {KeyboardEvent} e - DOM KeyboardEvent
 * @param {Object} shortcut - Shortcut definition
 * @param {string} shortcut.key - Target key code or char ('s', 'o', 'n', 'Enter', etc.)
 * @param {boolean} [shortcut.ctrl] - Requires Ctrl (or Cmd on Mac)
 * @param {boolean} [shortcut.shift] - Requires Shift
 * @param {boolean} [shortcut.alt] - Requires Alt/Option
 */
export const matchesShortcut = (e, shortcut) => {
  if (!e || !shortcut) return false;

  const targetKey = shortcut.key.toLowerCase();
  const eventKey = e.key.toLowerCase();

  // Match key code or key name
  const keyMatches = eventKey === targetKey || e.code.toLowerCase() === `key${targetKey}`;

  // Check modifier keys (Ctrl or Meta for Mac)
  const modifierMatches = shortcut.ctrl
    ? (e.ctrlKey || e.metaKey)
    : !(e.ctrlKey || e.metaKey);

  const shiftMatches = shortcut.shift ? e.shiftKey : !e.shiftKey;
  const altMatches = shortcut.alt ? e.altKey : !e.altKey;

  return keyMatches && modifierMatches && shiftMatches && altMatches;
};

/**
 * Returns a human-readable display string for a shortcut (e.g. "Ctrl+S" or "⌘S")
 */
export const formatShortcutLabel = (shortcut) => {
  const parts = [];
  if (shortcut.ctrl) parts.push(isMac ? "⌘" : "Ctrl");
  if (shortcut.shift) parts.push("Shift");
  if (shortcut.alt) parts.push(isMac ? "⌥" : "Alt");
  parts.push(shortcut.key.toUpperCase());
  return parts.join(isMac ? "" : "+");
};
