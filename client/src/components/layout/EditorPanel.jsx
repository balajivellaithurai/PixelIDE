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
import { registerAIInlineCompletionProvider } from "../../services/aiCompletionProvider";
import aiService from "../../services/aiService";
import collaborationService from "../../collaboration/collaborationService";
import BreadcrumbBar from "../ide/BreadcrumbBar";
import GitDiffViewer from "../git/GitDiffViewer";
import AIActionMenu from "../ai/AIActionMenu";

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

    // Register Monaco AI Inline Completion Provider
    registerAIInlineCompletionProvider(monaco);

    // Bind Yjs CRDT Collaboration Engine to Monaco Editor
    if (activeFileId) {
      collaborationService.bindMonacoEditor(editor, monaco, activeFileId);
    }

    // Context Menu AI Actions in Monaco Editor
    editor.addAction({
      id: "pix.ai.explain",
      label: "✨ AI: Explain Function / Selection",
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1,
      run: () => aiService.explainFunction(),
    });

    editor.addAction({
      id: "pix.ai.refactor",
      label: "✨ AI: Refactor (Diff Preview)",
      contextMenuGroupId: "navigation",
      contextMenuOrder: 2,
      run: () => aiService.refactorCodeWithDiff(),
    });

    editor.addAction({
      id: "pix.ai.fix",
      label: "✨ AI: Fix Bugs",
      contextMenuGroupId: "navigation",
      contextMenuOrder: 3,
      run: () => aiService.fixBug(),
    });

    editor.addAction({
      id: "pix.ai.comments",
      label: "✨ AI: Add Documentation / Comments",
      contextMenuGroupId: "navigation",
      contextMenuOrder: 4,
      run: () => aiService.generateComments(),
    });

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

  // Dynamically rebind Monaco Yjs collaboration service when active file tab switches
  useEffect(() => {
    if (editorRef.current && monacoRef.current && activeFileId) {
      collaborationService.bindMonacoEditor(editorRef.current, monacoRef.current, activeFileId);
    }
  }, [activeFileId]);

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
      {/* Top Header with Breadcrumbs & AI Action Bar */}
      <div className="flex items-center justify-between border-b border-neutral-800 pr-3 bg-neutral-900/40 select-none">
        <BreadcrumbBar />
        <AIActionMenu />
      </div>

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
            inlineCompletions: { enabled: true },
          }}
        />
      </div>
    </div>
  );
};

export default EditorPanel;