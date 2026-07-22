import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import useEditorStore from "../../store/editorStore";

const EditorPanel = () => {
  const { code, language, setCode } = useEditorStore();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Verify initial model language on mount
    const model = editor.getModel();
    if (model) {
      console.log(`[Monaco Initialized] Model Language ID: "${model.getLanguageId()}" | Zustand Language: "${language}"`);
    }
  };

  // Dynamically switch model language when language state changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, language);
        console.log(`[Monaco Language Update] Model Language ID: "${model.getLanguageId()}" | Zustand Language: "${language}"`);
      }
    }
  }, [language]);

  return (
    <div className="flex-1 bg-[#1e1e1e]">
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={(val) => setCode(val || "")}
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