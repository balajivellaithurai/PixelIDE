import { useState } from "react";
import { FiGitBranch, FiPlus, FiTrash2, FiCheck } from "react-icons/fi";
import useGitStore from "../../store/gitStore";
import useWorkspaceStore from "../../store/workspaceStore";
import toast from "react-hot-toast";

export default function GitBranchManager() {
  const { currentBranch, branches, createBranch, switchBranch, deleteBranch } = useGitStore();
  const { files } = useWorkspaceStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;

    try {
      await createBranch(newBranchName.trim(), files);
      toast.success(`Switched to new branch "${newBranchName.trim()}"`);
      setNewBranchName("");
      setIsCreating(false);
      setShowDropdown(false);
    } catch (err) {
      toast.error(err.message || "Failed to create branch");
    }
  };

  const handleSwitch = async (branch) => {
    if (branch === currentBranch) return;
    try {
      await switchBranch(branch, files);
      toast.success(`Switched to branch "${branch}"`);
      setShowDropdown(false);
    } catch (err) {
      toast.error(err.message || "Failed to switch branch");
    }
  };

  const handleDelete = async (e, branch) => {
    e.stopPropagation();
    try {
      await deleteBranch(branch, files);
      toast.success(`Deleted branch "${branch}"`);
    } catch (err) {
      toast.error(err.message || "Failed to delete branch");
    }
  };

  return (
    <div className="relative border-b border-neutral-800 pb-2 mb-3 select-none">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1.5 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-purple-500/40 text-xs text-neutral-200 font-mono transition cursor-pointer"
        >
          <FiGitBranch className="text-purple-400 text-xs" />
          <span className="font-semibold">{currentBranch || "main"}</span>
        </button>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition cursor-pointer"
          title="Create New Branch"
        >
          <FiPlus className="text-xs" />
        </button>
      </div>

      {/* Inline Create Input */}
      {isCreating && (
        <form onSubmit={handleCreate} className="flex gap-1.5 mt-2">
          <input
            autoFocus
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            placeholder="feature/branch-name"
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-mono"
          />
          <button
            type="submit"
            className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold cursor-pointer"
          >
            Create
          </button>
        </form>
      )}

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-30 p-1.5 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 py-1">
            Local Branches ({branches.length})
          </div>
          {branches.map((b) => {
            const isActive = b === currentBranch;
            return (
              <div
                key={b}
                onClick={() => handleSwitch(b)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition ${
                  isActive
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {isActive && <FiCheck className="text-purple-400 text-xs shrink-0" />}
                  <span className="truncate">{b}</span>
                </div>

                {!isActive && branches.length > 1 && (
                  <button
                    onClick={(e) => handleDelete(e, b)}
                    className="text-neutral-500 hover:text-red-400 p-1 rounded transition"
                    title="Delete branch"
                  >
                    <FiTrash2 className="text-xs" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
