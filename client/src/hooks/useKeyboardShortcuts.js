import { useEffect } from "react";
import toast from "react-hot-toast";
import useWorkspaceStore from "../store/workspaceStore";
import useEditorStore from "../store/editorStore";
import { matchesShortcut } from "../services/shortcutService";

export const SHORTCUTS = {
  SAVE_PROJECT: { key: "s", ctrl: true },
  OPEN_PROJECT: { key: "o", ctrl: true },
  NEW_FILE: { key: "n", ctrl: true },
  RUN_CODE: { key: "Enter", ctrl: true },
  CLOSE_TAB: { key: "w", ctrl: true },
};

export const handleGlobalShortcut = (e) => {
  // Prevent overriding native typing in standard text inputs/textareas
  const activeEl = document.activeElement;
  const isInputOrTextArea =
    activeEl &&
    (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA") &&
    activeEl.type !== "file";

  // Ctrl + S -> Save Project
  if (matchesShortcut(e, SHORTCUTS.SAVE_PROJECT)) {
    e.preventDefault();
    e.stopPropagation();
    useWorkspaceStore.getState().saveProject();
    toast.success("Project saved successfully!", { id: "shortcut-save" });
    return true;
  }

  // Ctrl + O -> Open Project
  if (matchesShortcut(e, SHORTCUTS.OPEN_PROJECT)) {
    e.preventDefault();
    e.stopPropagation();
    const fileInput = document.getElementById("pixelide-open-file-input");
    if (fileInput) {
      fileInput.click();
    }
    toast("Select a .pixel project file...", { icon: "📂", id: "shortcut-open" });
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
