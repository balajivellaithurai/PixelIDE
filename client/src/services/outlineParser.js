/**
 * Code Symbol Parser Service for Pix / PixelIDE (Sprint 11)
 * Extracts symbols (Classes, Functions, Methods, Variables) from active source code
 * with line & column positions for Outline Explorer & Breadcrumbs.
 */

export const parseFileOutline = (code = "", language = "javascript") => {
  if (!code || !code.trim()) return [];

  const lines = code.split("\n");
  const symbols = [];
  const lang = language.toLowerCase();

  lines.forEach((lineText, index) => {
    const lineNum = index + 1;
    const trimmed = lineText.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("/*")) {
      return;
    }

    // 1. Classes
    if (/^(export\s+)?(default\s+)?class\s+([A-Za-z0-9_$]+)/.test(trimmed)) {
      const match = trimmed.match(/class\s+([A-Za-z0-9_$]+)/);
      if (match) {
        symbols.push({
          name: match[1],
          type: "class",
          line: lineNum,
          column: lineText.indexOf(match[1]) + 1,
        });
      }
    } else if (lang === "python" && /^class\s+([A-Za-z0-9_$]+)/.test(trimmed)) {
      const match = trimmed.match(/^class\s+([A-Za-z0-9_$]+)/);
      if (match) {
        symbols.push({
          name: match[1],
          type: "class",
          line: lineNum,
          column: lineText.indexOf(match[1]) + 1,
        });
      }
    }

    // 2. Functions & Methods
    else if (/^(export\s+)?(async\s+)?function\s*([A-Za-z0-9_$]+)?\s*\(/.test(trimmed)) {
      const match = trimmed.match(/function\s*([A-Za-z0-9_$]+)?/);
      const funcName = match && match[1] ? match[1] : "anonymous()";
      symbols.push({
        name: funcName,
        type: "function",
        line: lineNum,
        column: Math.max(1, lineText.indexOf("function")),
      });
    } else if (/^(const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(async\s*)?\([^)]*\)\s*=>/.test(trimmed)) {
      const match = trimmed.match(/(const|let|var)\s+([A-Za-z0-9_$]+)/);
      if (match) {
        symbols.push({
          name: match[2],
          type: "function",
          line: lineNum,
          column: lineText.indexOf(match[2]) + 1,
        });
      }
    } else if (lang === "python" && /^def\s+([A-Za-z0-9_$]+)\s*\(/.test(trimmed)) {
      const match = trimmed.match(/^def\s+([A-Za-z0-9_$]+)/);
      if (match) {
        symbols.push({
          name: match[1],
          type: "function",
          line: lineNum,
          column: lineText.indexOf(match[1]) + 1,
        });
      }
    } else if (
      (lang === "java" || lang === "cpp" || lang === "c") &&
      /^(public|private|protected|static|void|int|double|float|string|bool)\s+([A-Za-z0-9_$]+)\s*\(/.test(trimmed)
    ) {
      const match = trimmed.match(/(public|private|protected|static|void|int|double|float|string|bool)\s+([A-Za-z0-9_$]+)\s*\(/);
      if (match) {
        symbols.push({
          name: match[2],
          type: "function",
          line: lineNum,
          column: lineText.indexOf(match[2]) + 1,
        });
      }
    }

    // 3. Top-level Variables / Constants
    else if (/^(export\s+)?(const|let|var)\s+([A-Za-z0-9_$]+)\s*=/.test(trimmed)) {
      const match = trimmed.match(/(const|let|var)\s+([A-Za-z0-9_$]+)/);
      if (match && !trimmed.includes("=>") && !trimmed.includes("function")) {
        symbols.push({
          name: match[2],
          type: "variable",
          line: lineNum,
          column: lineText.indexOf(match[2]) + 1,
        });
      }
    }
  });

  return symbols;
};

export default parseFileOutline;
