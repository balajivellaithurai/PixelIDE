/**
 * Service to manage active Monaco Editor instance reference and retrieve
 * current text selection, cursor position, and editor state.
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

export default {
  setEditorInstance,
  getEditorInstance,
  getSelectedCode,
  getCursorPosition,
  getMonacoLanguage,
};
