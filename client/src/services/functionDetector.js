/**
 * Function Detector Service for Pix / PixelIDE (Sprint 14)
 * Locates the function, class method, or logical code block surrounding a given cursor line position.
 */

import { parseFileOutline } from "./outlineParser";

/**
 * Finds the function or symbol enclosing the current cursor position in code.
 *
 * @param {string} code - Full source code text
 * @param {number} cursorLine - Current 1-indexed line number of the cursor
 * @param {string} [language="javascript"] - Programming language identifier
 * @returns {Object} Detected function details: { name, startLine, endLine, code }
 */
export const detectEnclosingFunction = (code = "", cursorLine = 1, language = "javascript") => {
  if (!code || !code.trim()) {
    return { name: "entire_file", startLine: 1, endLine: 1, code: "" };
  }

  const lines = code.split("\n");
  const maxLine = lines.length;
  const targetLine = Math.min(Math.max(1, cursorLine), maxLine);

  // Parse symbols from outline parser
  const symbols = parseFileOutline(code, language);

  // Find symbols that start on or before the current cursor line
  const precedingSymbols = symbols.filter(
    (sym) => sym.line <= targetLine && (sym.type === "function" || sym.type === "class")
  );

  if (precedingSymbols.length === 0) {
    // Fallback: extract ~25 surrounding lines or entire file
    const start = Math.max(1, targetLine - 12);
    const end = Math.min(maxLine, targetLine + 13);
    const snippet = lines.slice(start - 1, end).join("\n");
    return {
      name: "surrounding_code",
      startLine: start,
      endLine: end,
      code: snippet,
    };
  }

  // Nearest symbol on or before cursor line
  const matchedSymbol = precedingSymbols[precedingSymbols.length - 1];
  const startLine = matchedSymbol.line;

  // Determine end line of function block:
  // Find where braces or indentation level balance out, or next symbol starts
  const nextSymbol = symbols.find((sym) => sym.line > startLine);
  let endLine = nextSymbol ? nextSymbol.line - 1 : maxLine;

  // Refine endLine by matching curly braces if present
  let openBraces = 0;
  let braceFound = false;

  for (let i = startLine - 1; i < maxLine; i++) {
    const lineText = lines[i];
    for (const char of lineText) {
      if (char === "{") {
        openBraces++;
        braceFound = true;
      } else if (char === "}") {
        openBraces--;
        if (braceFound && openBraces <= 0) {
          endLine = i + 1;
          break;
        }
      }
    }
    if (braceFound && openBraces <= 0) break;
  }

  // Ensure cursor falls inside [startLine, endLine]
  if (targetLine < startLine || targetLine > endLine) {
    endLine = Math.max(startLine, targetLine + 10);
  }

  const functionLines = lines.slice(startLine - 1, endLine);
  const functionCode = functionLines.join("\n");

  return {
    name: matchedSymbol.name || "function",
    type: matchedSymbol.type,
    startLine,
    endLine,
    code: functionCode,
  };
};

export default detectEnclosingFunction;
