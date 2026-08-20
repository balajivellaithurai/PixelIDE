import { useEffect } from "react";
import toast from "react-hot-toast";
import useWorkspaceStore from "../store/workspaceStore";
import useEditorStore from "../store/editorStore";
import useIDEStore from "../store/ideStore";
import { matchesShortcut } from "../services/shortcutService";
import aiService from "../services/aiService";

export const SHORTCUTS = {
  SAVE_PROJECT: { key: "s", ctrl: true },
  OPEN_PROJECT: { key: "o", ctrl: true },
  NEW_FILE: { key: "n", ctrl: true },
  RUN_CODE: { key: "Enter", ctrl: true },
  CLOSE_TAB: { key: "w", ctrl: true },
  COMMAND_PALETTE: { key: "p", ctrl: true, shift: true },
  GLOBAL_SEARCH: { key: "f", ctrl: true, shift: true },
  AI_EXPLAIN: { key: "e", ctrl: true, shift: true },
  AI_FIX: { key: "x", ctrl: true, shift: true },
  AI_REFACTOR: { key: "r", ctrl: true, shift: true },
  AI_TESTS: { key: "t", ctrl: true, shift: true },
  AI_DOCS: { key: "d", ctrl: true, shift: true },
  AI_README: { key: "m", ctrl: true, shift: true },
};

export const handleGlobalShortcut = (e) => {
  // Ctrl + Shift + P or F1 -> Command Palette
  if (
    matchesShortcut(e, SHORTCUTS.COMMAND_PALETTE) ||
    (e.key === "F1" && !e.ctrlKey && !e.altKey)
  ) {
    e.preventDefault();
    e.stopPropagation();
    useIDEStore.getState().openCommandPalette();
    return true;
  }

  // Ctrl + Shift + F -> Global Search in Sidebar
  if (matchesShortcut(e, SHORTCUTS.GLOBAL_SEARCH)) {
    e.preventDefault();
    e.stopPropagation();
    useIDEStore.getState().setActiveSidebarTab("search");
    return true;
  }

  // AI Shortcuts
  if (matchesShortcut(e, SHORTCUTS.AI_EXPLAIN)) {
    e.preventDefault();
    e.stopPropagation();
    aiService.explainFunction();
    return true;
  }

  if (matchesShortcut(e, SHORTCUTS.AI_FIX)) {
    e.preventDefault();
    e.stopPropagation();
    aiService.fixBug();
    return true;
  }

  if (matchesShortcut(e, SHORTCUTS.AI_REFACTOR)) {
    e.preventDefault();
    e.stopPropagation();
    aiService.refactorCodeWithDiff();
    return true;
  }

  if (matchesShortcut(e, SHORTCUTS.AI_TESTS)) {
    e.preventDefault();
    e.stopPropagation();
    aiService.generateTests();
    return true;
  }

  if (matchesShortcut(e, SHORTCUTS.AI_DOCS)) {
    e.preventDefault();
    e.stopPropagation();
    aiService.generateComments();
    return true;
  }

  if (matchesShortcut(e, SHORTCUTS.AI_README)) {
    e.preventDefault();
    e.stopPropagation();
    aiService.generateReadme();
    return true;
  }

  // Prevent overriding native typing in standard text inputs/textareas
  const activeEl = document.activeElement;
  const isInputOrTextArea =
    activeEl &&
    (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA") &&
    activeEl.type !== "file";

  // Ctrl + S -> Save Current Project
  if (matchesShortcut(e, SHORTCUTS.SAVE_PROJECT)) {
    e.preventDefault();
    e.stopPropagation();
    useWorkspaceStore.getState().saveCurrentProject();
    toast.success("Project saved successfully!", { id: "shortcut-save" });
    return true;
  }

  // Ctrl + O -> Open Project Manager
  if (matchesShortcut(e, SHORTCUTS.OPEN_PROJECT)) {
    e.preventDefault();
    e.stopPropagation();
    useWorkspaceStore.getState().setShowProjectModal(true);
    return true;
  }

  // If typing inside form text inputs, skip file creation/close tab to avoid breaking user input
  if (isInputOrTextArea) return false;

  // Ctrl + N -> Create New File
  if (matchesShortcut(e, SHORTCUTS.NEW_FILE)) {
    e.preventDefault();
    e.stopPropagation();
    const existingFiles = useWorkspaceStore.getState().files;
    let count = 1;
    let newFileName = `untitled-${count}.js`;
    while (existingFiles.some((f) => f.name === newFileName)) {
      count++;
      newFileName = `untitled-${count}.js`;
    }

    useWorkspaceStore.getState().createFile(newFileName, "javascript");
    toast.success(`Created new file: ${newFileName}`, { id: "shortcut-new-file" });
    return true;
  }

  // Ctrl + Enter -> Run Current File
  if (matchesShortcut(e, SHORTCUTS.RUN_CODE)) {
    e.preventDefault();
    e.stopPropagation();
    const { isLoading, runCode } = useEditorStore.getState();
    if (!isLoading) {
      toast("Executing code...", { icon: "▶", id: "shortcut-run" });
      runCode();
    }
    return true;
  }

  // Ctrl + W -> Close Active Tab
  if (matchesShortcut(e, SHORTCUTS.CLOSE_TAB)) {
    e.preventDefault();
    e.stopPropagation();
    const { activeFileId, closeFile, files } = useWorkspaceStore.getState();
    if (activeFileId) {
      const closingFile = files.find((f) => f.id === activeFileId);
      closeFile(activeFileId);
      toast(`Closed ${closingFile ? closingFile.name : "tab"}`, {
        icon: "✕",
        id: "shortcut-close-tab",
      });
    }
    return true;
  }

  return false;
};

export default function useKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (e) => {
      handleGlobalShortcut(e);
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);
}
