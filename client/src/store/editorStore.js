import { create } from "zustand";

const getSavedEditorOptions = () => {
  try {
    const saved = localStorage.getItem("pix_editor_options");
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    fontSize: 14,
    tabSize: 2,
    wordWrap: "off",
    minimap: false,
  };
};

const useEditorStore = create((set) => ({
  language: "javascript",
  theme: "vs-dark",
  editorOptions: getSavedEditorOptions(),

  code: `function hello() {
  console.log("Welcome to PixelIDE 🚀");
}

hello();`,

  output: "",

  setLanguage: (language) => set({ language }),

  setTheme: (theme) => set({ theme }),

  setCode: (code) => set({ code }),

  setOutput: (output) => set({ output }),

  setEditorOptions: (updates) =>
    set((state) => {
      const updated = { ...state.editorOptions, ...updates };
      try {
        localStorage.setItem("pix_editor_options", JSON.stringify(updated));
      } catch (e) {}
      return { editorOptions: updated };
    }),
}));

export default useEditorStore;