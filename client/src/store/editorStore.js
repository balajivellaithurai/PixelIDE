import { create } from "zustand";

const useEditorStore = create((set) => ({
  language: "javascript",
  theme: "vs-dark",

  code: `function hello() {
  console.log("Welcome to PixelIDE 🚀");
}

hello();`,

  output: "",

  setLanguage: (language) => set({ language }),

  setTheme: (theme) => set({ theme }),

  setCode: (code) => set({ code }),

  setOutput: (output) => set({ output }),
}));

export default useEditorStore;