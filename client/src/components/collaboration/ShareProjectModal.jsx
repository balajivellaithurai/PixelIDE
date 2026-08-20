import { useState } from "react";
import { FiShare2, FiX, FiCopy, FiCheck, FiLink } from "react-icons/fi";
import useCollaborationStore from "../../collaboration/collaborationStore";
import useWorkspaceStore from "../../store/workspaceStore";
import { getShareableCollabUrl } from "../../collaboration/collaborationUtils";
import toast from "react-hot-toast";

export default function ShareProjectModal() {
  const { showShareModal, closeShareModal } = useCollaborationStore();
  const { currentProject } = useWorkspaceStore();
  const [copied, setCopied] = useState(false);

  if (!showShareModal) return null;

  const projectId = currentProject?.id || "default-project";
  const shareUrl = getShareableCollabUrl(projectId);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Collaboration link copied to clipboard!", { id: "collab-link-copied" });
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-6 font-sans">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <FiShare2 className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">
                Share Collaboration Session
              </h2>
              <p className="text-xs text-neutral-400">
                Invite team members to code collaboratively in real time.
              </p>
            </div>
          </div>

          <button
            onClick={closeShareModal}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs font-sans text-neutral-300">
          <div className="space-y-1.5">
            <label className="font-semibold text-white flex items-center gap-1.5">
              <FiLink className="text-purple-400" />
              Project Collaboration URL
            </label>
            <p className="text-[11px] text-neutral-400">
              Anyone with this link can join this project room and edit files in real time.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-xs text-purple-300 outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-md shadow-purple-600/20"
              >
                {copied ? <FiCheck className="text-sm" /> : <FiCopy className="text-sm" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-800 bg-neutral-950/90 font-sans">
          <button
            onClick={closeShareModal}
            className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
