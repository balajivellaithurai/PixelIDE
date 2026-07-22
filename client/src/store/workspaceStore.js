import { create } from "zustand";
import useEditorStore from "./editorStore";

const getLanguageFromFilename = (filename) => {
  const ext = filename.split(".").pop().toLowerCase();
  switch (ext) {
    case "py":
      return "python";
    case "cpp":
    case "cc":
    case "cxx":
      return "cpp";
    case "c":
      return "c";
    case "java":
      return "java";
    case "html":
      return "html";
    case "css":
      return "css";
    case "json":
      return "json";
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    default:
      return "javascript";
  }
};

const useWorkspaceStore = create((set, get) => ({
  activeFileId: "1",
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
      set({ activeFileId: id });
      useEditorStore.getState().setLanguage(file.language);
    }
  },
  addFile: (name) => {
    if (!name.trim()) return;
    const language = getLanguageFromFilename(name);
    const newFile = {
      id: Date.now().toString(),
      name: name.trim(),
      language,
    };
    set((state) => ({
      files: [...state.files, newFile],
      activeFileId: newFile.id,
    }));
    useEditorStore.getState().setLanguage(language);
  },
  deleteFile: (id) => {
    const currentFiles = get().files;
    if (currentFiles.length <= 1) return;
    const newFiles = currentFiles.filter((f) => f.id !== id);
    const nextActive = newFiles[0];
    set({
      files: newFiles,
      activeFileId: nextActive.id,
    });
    useEditorStore.getState().setLanguage(nextActive.language);
  },
}));

export default useWorkspaceStore;
