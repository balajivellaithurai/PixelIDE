import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import useEditorStore from "../../store/editorStore";
import useWorkspaceStore from "../../store/workspaceStore";

const EditorPanel = () => {
  const { code, language, setCode } = useEditorStore();
  const { activeFileId, updateFileContent } = useWorkspaceStore();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Verify initial model language on mount
    const model = editor.getModel();
    if (model) {
      console.log(
        `[Monaco Initialized] Model Language ID: "${model.getLanguageId()}" | Zustand Language: "${language}"`
      );
    }
  };

  // Dynamically switch model language when language state changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, language);
        console.log(
          `[Monaco Language Update] Model Language ID: "${model.getLanguageId()}" | Zustand Language: "${language}"`
        );
      }
    }
  }, [language]);

  const handleChange = (val) => {
    const newCode = val || "";
    setCode(newCode);
    if (activeFileId) {
      updateFileContent(activeFileId, newCode);
    }
  };

  return (
    <div className="flex-1 min-h-0 h-full bg-[#1e1e1e]">
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
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