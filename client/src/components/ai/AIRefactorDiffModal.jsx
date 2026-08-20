import { useRef } from "react";
import { DiffEditor } from "@monaco-editor/react";
import { FiCheck, FiX, FiRefreshCw, FiZap } from "react-icons/fi";
import useAIStore from "../../store/aiStore";
import useEditorStore from "../../store/editorStore";
import useWorkspaceStore from "../../store/workspaceStore";
import useIDEStore from "../../store/ideStore";
import useThemeStore from "../../store/themeStore";
import { applyMonacoTheme } from "../../utils/themeRegistry";
import toast from "react-hot-toast";

export default function AIRefactorDiffModal() {
  const { showRefactorModal, refactorPreviewData, closeRefactorModal } = useAIStore();
  const { setCode } = useEditorStore();
  const { activeFileId, updateFileContent } = useWorkspaceStore();
  const { markFileUnsaved } = useIDEStore();
  const { theme } = useThemeStore();
  const diffEditorRef = useRef(null);

  if (!showRefactorModal || !refactorPreviewData) return null;

  const { originalCode, refactoredCode, filename, language } = refactorPreviewData;

  const handleMount = (editor, monaco) => {
    diffEditorRef.current = editor;
    applyMonacoTheme(monaco, theme);
  };

  const handleAccept = () => {
    try {
      setCode(refactoredCode);
      if (activeFileId) {
        updateFileContent(activeFileId, refactoredCode);
        markFileUnsaved(activeFileId);
      }
      toast.success("AI Refactored code applied successfully!", { id: "ai-refactor-applied" });
      closeRefactorModal();
    } catch (err) {
      toast.error("Failed to apply refactored code: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-6 font-sans">
      <div className="w-full max-w-5xl h-[85vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <FiZap className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                AI Refactoring Preview
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-neutral-800 text-purple-300 border border-neutral-700">
                  {filename || "code"}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Review proposed changes (Original vs AI Suggested) before applying to source.
              </p>
            </div>
          </div>

          <button
            onClick={closeRefactorModal}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
            title="Cancel & Reject"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Monaco Diff Editor */}
        <div className="flex-1 min-h-0 relative bg-neutral-950">
          <DiffEditor
            height="100%"
            language={language || "javascript"}
            original={originalCode || ""}
            modified={refactoredCode || ""}
            onMount={handleMount}
            theme={theme}
            options={{
              fontSize: 13,
              renderSideBySide: true,
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-950/90 font-sans">
          <span className="text-xs text-neutral-400 flex items-center gap-1.5 font-mono">
            <FiRefreshCw className="text-purple-400" />
            Side-by-side Diff View
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={closeRefactorModal}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition cursor-pointer"
            >
              Reject Changes
            </button>
            <button
              onClick={handleAccept}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <FiCheck className="text-sm" />
              Accept & Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
