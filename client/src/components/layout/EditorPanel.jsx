import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import useEditorStore from "../../store/editorStore";
import useWorkspaceStore from "../../store/workspaceStore";
import useThemeStore from "../../store/themeStore";
import useIDEStore from "../../store/ideStore";
import useGitStore from "../../store/gitStore";
import { applyMonacoTheme } from "../../utils/themeRegistry";
import { handleGlobalShortcut } from "../../hooks/useKeyboardShortcuts";
import monacoService from "../../services/monacoService";
import { parseFileOutline } from "../../services/outlineParser";
import BreadcrumbBar from "../ide/BreadcrumbBar";
import GitDiffViewer from "../git/GitDiffViewer";

const EditorPanel = () => {
  const { code, language, setCode } = useEditorStore();
  const { activeFileId, updateFileContent, files } = useWorkspaceStore();
  const { theme } = useThemeStore();
  const { markFileUnsaved, setCurrentSymbol } = useIDEStore();
  const { activeDiffFile } = useGitStore();

  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const activeFile = files.find((f) => f.id === activeFileId);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monacoService.setEditorInstance(editor);
    applyMonacoTheme(monaco, theme);

    // Listen to cursor position changes to update active breadcrumb symbol
    editor.onDidChangeCursorPosition((e) => {
      const line = e.position.lineNumber;
      const currentCode = editor.getValue();
      const currentLang = activeFile?.language || language || "javascript";
      const symbols = parseFileOutline(currentCode, currentLang);

      // Find nearest symbol at or before current line
      let matchedSymbol = "";
      for (const sym of symbols) {
        if (sym.line <= line) {
          matchedSymbol = sym.name;
        } else {
          break;
        }
      }
      setCurrentSymbol(matchedSymbol);
    });

    // Bind Monaco editor keydown bridge to trigger global IDE shortcuts
    editor.onKeyDown((e) => {
      const handled = handleGlobalShortcut(e.browserEvent);
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
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
      markFileUnsaved(activeFileId);
    }
  };

  if (activeDiffFile) {
    return <GitDiffViewer />;
  }

  return (
    <div
      style={{ backgroundColor: "var(--bg-editor)" }}
      className="flex-1 min-h-0 h-full flex flex-col transition-colors duration-200"
    >
      {/* Breadcrumb Navigation Bar */}
      <BreadcrumbBar />

      <div className="flex-1 min-h-0 relative">
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
    </div>
  );
};

export default EditorPanel;