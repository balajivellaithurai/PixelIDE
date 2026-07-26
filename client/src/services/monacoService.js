/**
 * Service to manage active Monaco Editor instance reference and retrieve
 * current text selection, cursor position, editor state, and navigation.
 */

let activeEditorInstance = null;

export const setEditorInstance = (editor) => {
  activeEditorInstance = editor;
};

export const getEditorInstance = () => {
  return activeEditorInstance;
};

export const getSelectedCode = () => {
  if (!activeEditorInstance) return "";
  try {
    const selection = activeEditorInstance.getSelection();
    if (!selection || selection.isEmpty()) return "";
    const model = activeEditorInstance.getModel();
    if (!model) return "";
    return model.getValueInRange(selection) || "";
  } catch {
    return "";
  }
};

export const getCursorPosition = () => {
  if (!activeEditorInstance) return { line: 1, column: 1 };
  try {
    const position = activeEditorInstance.getPosition();
    return {
      line: position?.lineNumber || 1,
      column: position?.column || 1,
    };
  } catch {
    return { line: 1, column: 1 };
  }
};

export const getMonacoLanguage = () => {
  if (!activeEditorInstance) return "";
  try {
    const model = activeEditorInstance.getModel();
    return model?.getLanguageId() || "";
  } catch {
    return "";
  }
};

export const jumpToLine = (line = 1, column = 1) => {
  if (!activeEditorInstance) return;
  try {
    const targetLine = Math.max(1, line);
    const targetCol = Math.max(1, column);
    activeEditorInstance.revealLineInCenter(targetLine);
    activeEditorInstance.setPosition({ lineNumber: targetLine, column: targetCol });
    activeEditorInstance.focus();
  } catch (err) {
    console.warn("Monaco line jump failed:", err);
  }
};

export const onCursorPositionChange = (callback) => {
  if (!activeEditorInstance) return () => {};
  try {
    const disposable = activeEditorInstance.onDidChangeCursorPosition((e) => {
      if (callback) callback(e.position);
    });
    return () => disposable.dispose();
  } catch {
    return () => {};
  }
};

export default {
  setEditorInstance,
  getEditorInstance,
  getSelectedCode,
  getCursorPosition,
  getMonacoLanguage,
  jumpToLine,
  onCursorPositionChange,
};
