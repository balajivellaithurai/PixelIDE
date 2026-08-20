import { useState } from "react";
import { FiSave, FiX, FiFileText, FiEye, FiCode } from "react-icons/fi";
import useAIStore from "../../store/aiStore";
import useWorkspaceStore from "../../store/workspaceStore";
import toast from "react-hot-toast";

export default function ReadMePreviewModal() {
  const { showReadmeModal, readmePreviewData, closeReadmeModal } = useAIStore();
  const { files, createFile, updateFileContent, setActiveFile } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState("preview"); // "preview" | "code"

  if (!showReadmeModal || !readmePreviewData) return null;

  const { content, repoName } = readmePreviewData;

  const handleSaveReadme = () => {
    try {
      const existing = files.find(
        (f) => f.name.toLowerCase() === "readme.md" || f.name.toLowerCase() === "readme"
      );

      if (existing) {
        updateFileContent(existing.id, content);
        setActiveFile(existing.id);
        toast.success("Updated existing README.md in workspace!", { id: "readme-saved" });
      } else {
        const newFile = createFile("README.md", "markdown", content);
        if (newFile && newFile.id) {
          setActiveFile(newFile.id);
        }
        toast.success("Created README.md in workspace!", { id: "readme-created" });
      }

      closeReadmeModal();
    } catch (err) {
      toast.error("Failed to save README.md: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-6 font-sans">
      <div className="w-full max-w-4xl h-[85vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <FiFileText className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Generated README.md Preview
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-neutral-800 text-purple-300 border border-neutral-700">
                  {repoName || "Project"}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Workspace context analyzed. Review generated project documentation before saving.
              </p>
            </div>
          </div>

          <button
            onClick={closeReadmeModal}
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
            <FiEye /> Rendered Markdown
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === "code"
                ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <FiCode /> Raw Markdown Code
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 relative p-6 bg-neutral-950 text-neutral-200 overflow-auto">
          {activeTab === "preview" ? (
            <div className="prose prose-invert max-w-none text-xs leading-relaxed font-sans space-y-4">
              <pre className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-xs whitespace-pre-wrap leading-relaxed text-neutral-300">
                {content}
              </pre>
            </div>
          ) : (
            <pre className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-xs text-purple-300 whitespace-pre-wrap h-full overflow-auto">
              {content}
            </pre>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-950/90 font-sans">
          <span className="text-xs text-neutral-400">
            Click <strong className="text-purple-300">Save README.md</strong> to write file to workspace.
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={closeReadmeModal}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveReadme}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <FiSave className="text-sm" />
              Save README.md
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
