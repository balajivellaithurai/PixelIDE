import { useState, useEffect } from "react";
import {
  FiGitCommit,
  FiPlus,
  FiMinus,
  FiZap,
  FiCheckCircle,
  FiFolderPlus,
  FiGitBranch,
} from "react-icons/fi";
import useGitStore from "../../store/gitStore";
import useWorkspaceStore from "../../store/workspaceStore";
import aiService from "../../services/aiService";
import GitBranchManager from "./GitBranchManager";
import GitCommitHistory from "./GitCommitHistory";
import FileIcon from "../ide/FileIcon";
import toast from "react-hot-toast";

export default function GitPanel() {
  const {
    isGitRepo,
    staged,
    unstaged,
    commitMessage,
    setCommitMessage,
    isCommitting,
    isLoading,
    stageFile,
    unstageFile,
    stageAll,
    unstageAll,
    commit,
    initRepo,
    refreshGitStatus,
    openDiff,
  } = useGitStore();
  const { files } = useWorkspaceStore();

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    refreshGitStatus(files);
  }, [files, refreshGitStatus]);

  const handleInitGit = async () => {
    try {
      await initRepo(files);
      toast.success("Git repository initialized successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to initialize Git repository");
    }
  };

  const handleStageFile = async (e, file) => {
    e.stopPropagation();
    try {
      await stageFile(file.path || file.id, files);
    } catch (err) {
      toast.error(err.message || "Failed to stage file.");
    }
  };

  const handleUnstageFile = async (e, file) => {
    e.stopPropagation();
    try {
      await unstageFile(file.path || file.id, files);
    } catch (err) {
      toast.error(err.message || "Failed to unstage file.");
    }
  };

  const handleStageAll = async () => {
    try {
      await stageAll(files);
      toast.success("All files staged.");
    } catch (err) {
      toast.error(err.message || "Failed to stage files.");
    }
  };

  const handleUnstageAll = async () => {
    try {
      await unstageAll(files);
      toast.success("All files unstaged.");
    } catch (err) {
      toast.error(err.message || "Failed to unstage files.");
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      toast.error("Please type a commit message first.");
      return;
    }
    if (staged.length === 0) {
      toast.error("No staged changes to commit. Stage files first.");
      return;
    }

    try {
      await commit(files);
      toast.success("Committed changes successfully!");
    } catch (err) {
      toast.error(err.message || "Commit failed.");
    }
  };

  const handleGenerateAICommitMessage = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await aiService.generateCommitMessage();
      if (res) {
        const lines = res.split("\n");
        const conventionalLine = lines.find(
          (l) =>
            l.startsWith("feat") ||
            l.startsWith("fix") ||
            l.startsWith("refactor") ||
            l.startsWith("docs") ||
            l.startsWith("style") ||
            l.startsWith("test") ||
            l.startsWith("chore") ||
            (l.includes(":") && !l.startsWith("#") && !l.startsWith("-"))
        );
        const cleanMsg = conventionalLine
          ? conventionalLine.replace(/[`*]/g, "").trim()
          : res.slice(0, 100).trim();

        setCommitMessage(cleanMsg);
        toast.success("AI Commit message generated from staged diff!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to generate AI commit message.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "M":
        return <span className="text-amber-400 font-bold text-[10px]" title="Modified">M</span>;
      case "A":
      case "U":
        return <span className="text-emerald-400 font-bold text-[10px]" title="Added / Untracked">A</span>;
      case "D":
        return <span className="text-red-400 font-bold text-[10px]" title="Deleted">D</span>;
      default:
        return <span className="text-neutral-400 font-bold text-[10px]">M</span>;
    }
  };

  if (!isGitRepo) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4 text-center font-sans space-y-4 select-none">
        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
          <FiGitBranch className="text-3xl" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">No Git Repository Found</h3>
          <p className="text-xs text-neutral-400 mt-1">
            This workspace is not a Git repository.
            <br />
            Initialize Git to enable Source Control.
          </p>
        </div>
        <button
          onClick={handleInitGit}
          disabled={isLoading}
          className="py-2 px-4 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/25 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          <FiFolderPlus />
          <span>{isLoading ? "Initializing..." : "Initialize Git Repository"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-3 font-sans select-none">
      {/* Branch Selector Header */}
      <GitBranchManager />

      {/* Commit Box */}
      <div className="space-y-2 p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/40">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <FiGitCommit className="text-purple-400" />
            Commit Message
          </span>
          <span className="text-[10px] text-neutral-500 font-mono">
            {commitMessage.length}/100
          </span>
        </div>

        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Message (Ctrl+Enter to commit)..."
          rows={2}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50 resize-none font-mono"
        />

        <div className="flex items-center gap-2">
          {/* AI Commit Generator Button */}
          <button
            onClick={handleGenerateAICommitMessage}
            disabled={isGeneratingAI}
            className="flex-1 py-1.5 px-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-purple-500/40 text-purple-300 text-[11px] font-medium rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            title="Generate commit message using Gemini AI"
          >
            <FiZap className="text-purple-400 text-xs" />
            <span>{isGeneratingAI ? "Generating..." : "AI Commit Msg"}</span>
          </button>

          {/* Commit Button */}
          <button
            onClick={handleCommit}
            disabled={!commitMessage.trim() || staged.length === 0 || isCommitting}
            className="flex-1 py-1.5 px-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-40 text-white text-[11px] font-semibold rounded-lg shadow-md shadow-purple-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <FiCheckCircle className="text-xs" />
            <span>{isCommitting ? "Committing..." : `Commit (${staged.length})`}</span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Changes Lists */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {/* Staged Changes Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              Staged Changes ({staged.length})
            </span>
            {staged.length > 0 && (
              <button
                onClick={handleUnstageAll}
                className="text-[10px] text-neutral-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-neutral-800 transition cursor-pointer"
                title="Unstage All"
              >
                Unstage All
              </button>
            )}
          </div>

          {staged.length === 0 ? (
            <div className="text-[11px] text-neutral-500 italic px-1 py-1">
              No staged files.
            </div>
          ) : (
            staged.map((file) => (
              <div
                key={`staged-${file.path || file.id}`}
                onClick={() => openDiff(file)}
                className="group flex items-center justify-between px-2 py-1 rounded-lg hover:bg-neutral-800/80 cursor-pointer text-xs font-mono transition"
              >
                <div className="flex items-center gap-2 truncate">
                  {getStatusBadge(file.status)}
                  <FileIcon filename={file.name} className="w-3.5 h-3.5" />
                  <span className="text-neutral-200 truncate">{file.name}</span>
                </div>

                <button
                  onClick={(e) => handleUnstageFile(e, file)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-white rounded transition cursor-pointer"
                  title="Unstage file"
                >
                  <FiMinus className="text-xs" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Changes Section (Unstaged) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              Changes ({unstaged.length})
            </span>
            {unstaged.length > 0 && (
              <button
                onClick={handleStageAll}
                className="text-[10px] text-neutral-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-neutral-800 transition cursor-pointer"
                title="Stage All"
              >
                Stage All
              </button>
            )}
          </div>

          {unstaged.length === 0 ? (
            <div className="text-[11px] text-neutral-500 italic px-1 py-1">
              Working tree clean.
            </div>
          ) : (
            unstaged.map((file) => (
              <div
                key={`unstaged-${file.path || file.id}`}
                onClick={() => openDiff(file)}
                className="group flex items-center justify-between px-2 py-1 rounded-lg hover:bg-neutral-800/80 cursor-pointer text-xs font-mono transition"
              >
                <div className="flex items-center gap-2 truncate">
                  {getStatusBadge(file.status)}
                  <FileIcon filename={file.name} className="w-3.5 h-3.5" />
                  <span className="text-neutral-200 truncate">{file.name}</span>
                </div>

                <button
                  onClick={(e) => handleStageFile(e, file)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-white rounded transition cursor-pointer"
                  title="Stage file"
                >
                  <FiPlus className="text-xs" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Commit History View */}
        <GitCommitHistory />
      </div>
    </div>
  );
}
