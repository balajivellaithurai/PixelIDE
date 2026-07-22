import { create } from "zustand";
import useEditorStore from "./editorStore";

const useWorkspaceStore = create((set, get) => ({
  activeFileId: "1",
  openFileIds: ["1", "2", "3", "4", "5"],
  files: [
    { id: "1", name: "main.cpp", language: "cpp" },
    { id: "2", name: "script.py", language: "python" },
    { id: "3", name: "app.js", language: "javascript" },
    { id: "4", name: "main.c", language: "c" },
    { id: "5", name: "Main.java", language: "java" },
  ],

  setActiveFile: (id) => {
    const file = get().files.find((f) => f.id === id);
    if (file) {
      set((state) => ({
        activeFileId: id,
        openFileIds: state.openFileIds.includes(id)
          ? state.openFileIds
          : [...state.openFileIds, id],
      }));
      useEditorStore.getState().setLanguage(file.language);
    }
  },

  createFile: (name, language) => {
    if (!name || !name.trim()) return;
    const newFile = {
      id: crypto.randomUUID(),
      name: name.trim(),
      language: language || "plaintext",
    };

    set((state) => ({
      files: [...state.files, newFile],
      openFileIds: [...state.openFileIds, newFile.id],
      activeFileId: newFile.id,
    }));

    useEditorStore.getState().setLanguage(newFile.language);
  },

  closeTab: (id) => {
    const { openFileIds, activeFileId, files } = get();
    const updatedOpen = openFileIds.filter((fileId) => fileId !== id);

    let nextActive = activeFileId;
    if (activeFileId === id) {
      nextActive = updatedOpen.length > 0 ? updatedOpen[updatedOpen.length - 1] : null;
    }

    set({
      openFileIds: updatedOpen,
      activeFileId: nextActive,
    });

    if (nextActive) {
      const activeFile = files.find((f) => f.id === nextActive);
      if (activeFile) {
        useEditorStore.getState().setLanguage(activeFile.language);
      }
    }
  },

  deleteFile: (id) => {
    const { files } = get();
    if (files.length <= 1) return;

    const newFiles = files.filter((f) => f.id !== id);
    get().closeTab(id);
    set({ files: newFiles });
  },
}));

export default useWorkspaceStore;
