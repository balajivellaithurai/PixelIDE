/**
 * AI Context Builder Service for PixelIDE (Sprint 10)
 * Assembles a unified, structured AI context object containing active source code,
 * Monaco text selection, cursor line/column coordinates, workspace filename, and Judge0 execution outputs.
 */

import useEditorStore from "../store/editorStore";
import useWorkspaceStore from "../store/workspaceStore";
import monacoService from "./monacoService";

/**
 * Builds standard AI Context object for AI actions.
 * @param {string} action - Name of AI action (e.g. REVIEW, DEBUG, EXPLAIN, OPTIMIZE, TESTS, DOCS)
 * @param {Object} [overrides={}] - Optional property overrides
 * @returns {Object} Structured AI Context
 */
export const buildAIContext = (action = "CUSTOM", overrides = {}) => {
  const editorState = useEditorStore.getState();
  const workspaceState = useWorkspaceStore.getState();

  // Active File Identification
  const activeFile = workspaceState.files.find(
    (f) => f.id === workspaceState.activeFileId
  );
  const filename = activeFile?.name || overrides.filename || "untitled.txt";
  const language =
    overrides.language ||
    activeFile?.language ||
    editorState.language ||
    monacoService.getMonacoLanguage() ||
    "javascript";

  // Code & Selection
  const sourceCode =
    overrides.sourceCode !== undefined ? overrides.sourceCode : editorState.code || "";
  const selectedCode =
    overrides.selectedCode !== undefined
      ? overrides.selectedCode
      : monacoService.getSelectedCode();

  // Cursor Position
  const cursorPos = monacoService.getCursorPosition();
  const cursorLine = overrides.cursorLine || cursorPos.line;
  const cursorColumn = overrides.cursorColumn || cursorPos.column;

  // Judge0 / Console Outputs
  const lastExec = editorState.lastExecutionResult || {};
  const consoleOutput = editorState.output || "";
  const compileOutput = lastExec.compileOutput || "";
  const stderr = lastExec.stderr || "";
  const stdout = lastExec.stdout || "";
  const exitCode = lastExec.exitCode !== undefined ? lastExec.exitCode : null;
  const status = lastExec.status || (consoleOutput ? "Executed" : "Idle");

  return {
    language,
    filename,
    sourceCode,
    selectedCode: selectedCode ? selectedCode.trim() : "",
    cursorLine,
    cursorColumn,
    consoleOutput,
    compileOutput,
    stderr,
    stdout,
    exitCode,
    status,
    action,
    ...overrides,
  };
};

export default buildAIContext;
