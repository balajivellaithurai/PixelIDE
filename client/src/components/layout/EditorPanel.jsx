import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import useEditorStore from "../../store/editorStore";
import useWorkspaceStore from "../../store/workspaceStore";
import useThemeStore from "../../store/themeStore";
import { applyMonacoTheme } from "../../utils/themeRegistry";

const EditorPanel = () => {
  const { code, language, setCode } = useEditorStore();
  const { activeFileId, updateFileContent } = useWorkspaceStore();
  const { theme } = useThemeStore();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    applyMonacoTheme(monaco, theme);

    const model = editor.getModel();
    if (model) {
      console.log(
        `[Monaco Initialized] Model Language: "${model.getLanguageId()}" | Theme: "${theme}"`
      );
    }
  };

  // Dynamically switch model language when language state changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  // Dynamically switch Monaco theme when theme state changes
  useEffect(() => {
    if (monacoRef.current) {
      applyMonacoTheme(monacoRef.current, theme);
    }
  }, [theme]);

  const handleChange = (val) => {
    const newCode = val || "";
    setCode(newCode);
    if (activeFileId) {
      updateFileContent(activeFileId, newCode);
    }
  };

  return (
    <div
      style={{ backgroundColor: "var(--bg-editor)" }}
      className="flex-1 min-h-0 h-full transition-colors duration-200"
    >
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme={theme}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default EditorPanel;