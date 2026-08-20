import { useState } from "react";
import { FiCheck, FiX, FiFileText, FiEye, FiCode } from "react-icons/fi";
import useAIStore from "../../store/aiStore";
import useEditorStore from "../../store/editorStore";
import useWorkspaceStore from "../../store/workspaceStore";
import useIDEStore from "../../store/ideStore";
import toast from "react-hot-toast";

export default function CommentPreviewModal() {
  const { showCommentModal, commentPreviewData, closeCommentModal } = useAIStore();
  const { code, setCode } = useEditorStore();
  const { activeFileId, updateFileContent } = useWorkspaceStore();
  const { markFileUnsaved } = useIDEStore();

  const [activeTab, setActiveTab] = useState("preview"); // "preview" | "sideBySide"

  if (!showCommentModal || !commentPreviewData) return null;

  const { originalCode, commentedCode, filename, language, isSelection } = commentPreviewData;

  const handleApply = () => {
    try {
      let finalCode = "";
      if (isSelection && originalCode) {
        finalCode = code.replace(originalCode, commentedCode);
      } else {
        finalCode = commentedCode;
      }

      setCode(finalCode);
      if (activeFileId) {
        updateFileContent(activeFileId, finalCode);
        markFileUnsaved(activeFileId);
      }
      toast.success("Generated comments applied to source!", { id: "comments-applied" });
      closeCommentModal();
    } catch (err) {
      toast.error("Failed to apply comments: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-6 font-sans">
      <div className="w-full max-w-4xl h-[80vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <FiFileText className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Generated Comments & Documentation
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-neutral-800 text-purple-300 border border-neutral-700">
                  {filename || "code"}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Preview generated docstrings and comments before applying to source file.
              </p>
            </div>
          </div>

          <button
            onClick={closeCommentModal}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
            title="Cancel"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-neutral-800 bg-neutral-900/50 text-xs font-mono">
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === "preview"
                ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <FiEye /> Commented Code
          </button>
          <button
            onClick={() => setActiveTab("sideBySide")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === "sideBySide"
                ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <FiCode /> Original vs Commented
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 relative p-4 bg-neutral-950 font-mono text-xs overflow-auto">
          {activeTab === "preview" ? (
            <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-200 overflow-auto h-full border border-neutral-800 whitespace-pre-wrap leading-relaxed">
              {commentedCode}
            </pre>
          ) : (
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="flex flex-col h-full">
                <div className="text-[11px] font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                  Original Code
                </div>
                <pre className="flex-1 p-3 rounded-xl bg-neutral-900 text-neutral-400 overflow-auto border border-neutral-800 whitespace-pre-wrap">
                  {originalCode}
                </pre>
              </div>
              <div className="flex flex-col h-full">
                <div className="text-[11px] font-semibold text-purple-300 mb-2 uppercase tracking-wider">
                  Commented Code
                </div>
                <pre className="flex-1 p-3 rounded-xl bg-neutral-900 text-purple-200 overflow-auto border border-purple-500/30 whitespace-pre-wrap">
                  {commentedCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-950/90 font-sans">
          <span className="text-xs text-neutral-400">
            Click <strong className="text-purple-300">Apply</strong> to update source code in editor.
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={closeCommentModal}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <FiCheck className="text-sm" />
              Apply Comments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
