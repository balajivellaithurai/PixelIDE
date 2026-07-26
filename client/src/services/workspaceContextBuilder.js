/**
 * Workspace Context Engine for Pix / PixelIDE (Sprint 10)
 * Aggregates complete workspace state: all open files, active file, file tree,
 * recently edited files, programming language, Monaco selection/cursor position, and Judge0 outputs.
 */

import useEditorStore from "../store/editorStore";
import useWorkspaceStore from "../store/workspaceStore";
import monacoService from "./monacoService";

/**
 * Builds a structured, complete Workspace Context payload for AI actions and AI Chat.
 * @param {string} [action="CUSTOM"] - AI action identifier
 * @param {Object} [overrides={}] - Optional property overrides
 * @returns {Object} Structured Workspace Context
 */
export const buildWorkspaceContext = (action = "CUSTOM", overrides = {}) => {
  const editorState = useEditorStore.getState();
  const workspaceState = useWorkspaceStore.getState();

  // All Files & Active File
  const files = workspaceState.files || [];
  const activeFile = files.find((f) => f.id === workspaceState.activeFileId) || null;
  const fileNames = files.map((f) => f.name);

  // File & Language Context
  const filename = activeFile?.name || overrides.filename || "untitled.txt";
  const language =
    overrides.language ||
    activeFile?.language ||
    editorState.language ||
    monacoService.getMonacoLanguage() ||
    "javascript";

  // Source Code & Monaco Selection
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

  // Recently Edited Files & Project Structure
  const recentlyEditedFiles = workspaceState.recentlyEditedFiles || fileNames.slice(0, 5);
  const projectTree = files.map((f) => `- ${f.name} (${f.language || "text"})`).join("\n");

  // Judge0 Execution Context
  const lastExec = editorState.lastExecutionResult || {};
  const consoleOutput = editorState.output || "";
  const compileOutput = lastExec.compileOutput || "";
  const stderr = lastExec.stderr || "";
  const stdout = lastExec.stdout || "";
  const exitCode = lastExec.exitCode !== undefined ? lastExec.exitCode : null;
  const status = lastExec.status || (consoleOutput ? "Executed" : "Idle");

  return {
    action,
    filename,
    language,
    sourceCode,
    selectedCode: selectedCode ? selectedCode.trim() : "",
    cursorLine,
    cursorColumn,
    files: files.map((f) => ({
      id: f.id,
      name: f.name,
      language: f.language,
      contentLength: f.content ? f.content.length : 0,
      content: f.content || "",
    })),
    activeFile: activeFile
      ? {
          id: activeFile.id,
          name: activeFile.name,
          language: activeFile.language,
        }
      : null,
    fileNames,
    projectTree,
    recentlyEditedFiles,
    consoleOutput,
    compileOutput,
    stderr,
    stdout,
    exitCode,
    status,
    ...overrides,
  };
};

export default buildWorkspaceContext;
