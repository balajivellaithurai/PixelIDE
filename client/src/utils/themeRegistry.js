/**
 * Custom Monaco Editor Theme Definitions & Utility
 */

export const draculaTheme = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", background: "282a36", foreground: "f8f8f2" },
    { token: "comment", foreground: "6272a4", fontStyle: "italic" },
    { token: "string", foreground: "f1fa8c" },
    { token: "number", foreground: "bd93f9" },
    { token: "keyword", foreground: "ff79c6" },
    { token: "operator", foreground: "ff79c6" },
    { token: "function", foreground: "50fa7b" },
    { token: "variable", foreground: "8be9fd" },
    { token: "type", foreground: "8be9fd", fontStyle: "italic" },
  ],
  colors: {
    "editor.background": "#282a36",
    "editor.foreground": "#f8f8f2",
    "editor.selectionBackground": "#44475a",
    "editor.lineHighlightBackground": "#44475a43",
    "editorCursor.foreground": "#f8f8f0",
    "editorWhitespace.foreground": "#ffffff1a",
    "editorIndentGuide.background": "#44475a",
    "editorIndentGuide.activeBackground": "#6272a4",
  },
};

export const monokaiTheme = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", background: "272822", foreground: "f8f8f2" },
    { token: "comment", foreground: "75715e", fontStyle: "italic" },
    { token: "string", foreground: "e6db74" },
    { token: "number", foreground: "ae81ff" },
    { token: "keyword", foreground: "f92672" },
    { token: "operator", foreground: "f92672" },
    { token: "function", foreground: "a6e22e" },
    { token: "variable", foreground: "fd971f" },
  ],
  colors: {
    "editor.background": "#272822",
    "editor.foreground": "#f8f8f2",
    "editor.selectionBackground": "#49483e",
    "editor.lineHighlightBackground": "#3e3d32",
    "editorCursor.foreground": "#f8f8f0",
    "editorWhitespace.foreground": "#464741",
  },
};

export const githubDarkTheme = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", background: "0d1117", foreground: "c9d1d9" },
    { token: "comment", foreground: "8b949e", fontStyle: "italic" },
    { token: "string", foreground: "a5d6ff" },
    { token: "number", foreground: "79c0ff" },
    { token: "keyword", foreground: "ff7b72" },
    { token: "operator", foreground: "79c0ff" },
    { token: "function", foreground: "d2a8ff" },
    { token: "variable", foreground: "ffa657" },
  ],
  colors: {
    "editor.background": "#0d1117",
    "editor.foreground": "#c9d1d9",
    "editor.selectionBackground": "#163356",
    "editor.lineHighlightBackground": "#161b22",
    "editorCursor.foreground": "#58a6ff",
    "editorWhitespace.foreground": "#21262d",
  },
};

export const registerMonacoThemes = (monaco) => {
  if (!monaco) return;
  monaco.editor.defineTheme("dracula", draculaTheme);
  monaco.editor.defineTheme("monokai", monokaiTheme);
  monaco.editor.defineTheme("github-dark", githubDarkTheme);
};

export const applyMonacoTheme = (monaco, themeId) => {
  if (!monaco) return;
  registerMonacoThemes(monaco);
  monaco.editor.setTheme(themeId);
};
