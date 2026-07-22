import { create } from "zustand";
import axios from "axios";

const CODE_SNIPPETS = {
  javascript: '// JavaScript\nconsole.log("Hello, World!");',
  python: '# Python\nprint("Hello, World!")',
  cpp: '// C++\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
  c: '// C\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  java: '// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
};

const useEditorStore = create((set, get) => ({
  language: "javascript",
  code: CODE_SNIPPETS.javascript,
  output: "",
  isLoading: false,
  setLanguage: (language) =>
    set((state) => ({
      language,
      code: CODE_SNIPPETS[language] || state.code,
    })),
  setCode: (code) => set({ code }),
  setOutput: (output) => set({ output }),
  runCode: async () => {
    const { language, code } = get();
    set({ isLoading: true, output: "Executing code..." });

    try {
      const response = await axios.post("http://localhost:5000/api/execute", {
        language,
        code,
      });

      set({
        output: response.data.output || "Code executed successfully.",
        isLoading: false,
      });
    } catch (error) {
      console.error("Execution error:", error);
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.details ||
        "Execution failed. Ensure the backend server is running on port 5000.";
      set({ output: `Error: ${errMsg}`, isLoading: false });
    }
  },
}));

export default useEditorStore;
