import { useEffect } from "react";
import { FiGitBranch, FiRefreshCw, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import useGitStore from "../../store/gitStore";
import useWorkspaceStore from "../../store/workspaceStore";

export default function GitStatusBar() {
  const { isGitRepo, currentBranch, staged, unstaged, refreshGitStatus } = useGitStore();
  const { files } = useWorkspaceStore();

  useEffect(() => {
    refreshGitStatus(files);
  }, [files, refreshGitStatus]);

  return (
    <div className="h-6 bg-neutral-950 border-t border-neutral-800/80 px-3 flex items-center justify-between text-[11px] font-mono text-neutral-400 select-none shrink-0 z-10">
      {/* Left Items: Branch & Staged/Unstaged counts */}
      <div className="flex items-center gap-3">
        {isGitRepo ? (
          <>
            <div className="flex items-center gap-1 hover:text-white transition cursor-pointer">
              <FiGitBranch className="text-purple-400 text-xs" />
              <span className="font-semibold text-neutral-300">{currentBranch || "main"}</span>
            </div>

            <div className="flex items-center gap-2 text-[10px]">
              {staged.length > 0 && (
                <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                  +{staged.length} Staged
                </span>
              )}
              {unstaged.length > 0 && (
                <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded">
                  ~{unstaged.length} Changes
                </span>
              )}
              {staged.length === 0 && unstaged.length === 0 && (
                <span className="text-neutral-500 flex items-center gap-1">
                  <FiCheckCircle className="text-emerald-500 text-xs" /> Clean
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1 text-neutral-500">
            <FiAlertCircle className="text-amber-500 text-xs" />
            <span>No Git Repository</span>
          </div>
        )}
      </div>

      {/* Right Items: Sync Status */}
      <div className="flex items-center gap-2 text-[10px] text-neutral-500">
        {isGitRepo && <FiRefreshCw className="text-[10px] text-purple-400 animate-spin-slow" />}
        <span>{isGitRepo ? "Git Synced" : "Source Control Offline"}</span>
      </div>
    </div>
  );
}
