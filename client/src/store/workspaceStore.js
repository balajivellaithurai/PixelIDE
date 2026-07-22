import { create } from "zustand";
import useEditorStore from "./editorStore";

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
}));

createFile: (name, language) =>
    set((state) => {
        const newFile = {
            id: crypto.randomUUID(),
            name,
            language,
            content: "",
        };

        return {
            files: [...state.files, newFile],
            activeFileId: newFile.id,
        };
    }),

export default useWorkspaceStore;
