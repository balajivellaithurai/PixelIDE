import { create } from "zustand";
import useEditorStore from "./editorStore";

const getLanguageFromFilename = (filename) => {
  const ext = filename.split(".").pop()?.toLowerCase();
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

const defaultFile = {
  id: "1",
  name: "app.js",
  language: "javascript",
  content: `// JavaScript\nconsole.log("Hello, World!");`,
};

const useWorkspaceStore = create((set, get) => ({
  files: [
    defaultFile,
    {
      id: "2",
      name: "script.py",
      language: "python",
      content: '# Python\nprint("Hello, World!")',
    },
    {
      id: "3",
      name: "main.cpp",
      language: "cpp",
      content:
        '// C++\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
    },
  ],
  activeFileId: "1",
  openFiles: ["1", "2", "3"],

  setActiveFile: (id) => {
    const file = get().files.find((f) => f.id === id);
    if (file) {
      set((state) => ({
        activeFileId: id,
        openFiles: state.openFiles.includes(id)
          ? state.openFiles
          : [...state.openFiles, id],
      }));
      useEditorStore.getState().setLanguage(file.language);
      if (file.content !== undefined) {
        useEditorStore.getState().setCode(file.content);
      }
    }
  },

  updateFileContent: (id, content) =>
    set((state) => ({
      files: state.files.map((file) =>
        file.id === id ? { ...file, content } : file
      ),
    })),

  createFile: (name, language) => {
    if (!name || !name.trim()) return;
    const inferredLang = language || getLanguageFromFilename(name);
    const newFile = {
      id: crypto.randomUUID(),
      name: name.trim(),
      language: inferredLang,
      content: "",
    };

    set((state) => ({
      files: [...state.files, newFile],
      openFiles: [...state.openFiles, newFile.id],
      activeFileId: newFile.id,
    }));

    useEditorStore.getState().setLanguage(newFile.language);
    useEditorStore.getState().setCode("");
  },

  closeFile: (id) =>
    set((state) => {
      const openFiles = state.openFiles.filter((fileId) => fileId !== id);
      let nextActive = state.activeFileId;
      if (state.activeFileId === id) {
        nextActive =
          openFiles.length > 0 ? openFiles[openFiles.length - 1] : null;
      }
      if (nextActive) {
        const file = state.files.find((f) => f.id === nextActive);
        if (file) {
          useEditorStore.getState().setLanguage(file.language);
          if (file.content !== undefined) {
            useEditorStore.getState().setCode(file.content);
          }
        }
      }
      return {
        openFiles,
        activeFileId: nextActive,
      };
    }),

  deleteFile: (id) =>
    set((state) => {
      const files = state.files.filter((f) => f.id !== id);
      const openFiles = state.openFiles.filter((fileId) => fileId !== id);
      let nextActive = state.activeFileId;

      if (state.activeFileId === id) {
        nextActive =
          openFiles.length > 0
            ? openFiles[openFiles.length - 1]
            : files[0]?.id || null;
      }

      if (nextActive) {
        const file = files.find((f) => f.id === nextActive);
        if (file) {
          useEditorStore.getState().setLanguage(file.language);
          if (file.content !== undefined) {
            useEditorStore.getState().setCode(file.content);
          }
        }
      }

      return {
        files,
        openFiles,
        activeFileId: nextActive,
      };
    }),
}));

export default useWorkspaceStore;