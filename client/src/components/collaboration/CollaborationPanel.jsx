import { useState } from "react";
import { FiUsers, FiShare2, FiEdit2, FiCheck } from "react-icons/fi";
import useCollaborationStore from "../../collaboration/collaborationStore";
import collaborationService from "../../collaboration/collaborationService";
import CollaboratorList from "./CollaboratorList";
import CollaborationChat from "./CollaborationChat";
import CollaborationStatus from "./CollaborationStatus";

export default function CollaborationPanel() {
  const { identity, setIdentity, openShareModal } = useCollaborationStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(identity.name || "");

  const handleSaveName = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const updated = { ...identity, name: nameInput.trim() };
    setIdentity(updated);
    collaborationService.notifyUsernameChanged(nameInput.trim());
    setIsEditingName(false);
  };

  return (
    <div className="flex flex-col h-full space-y-4 font-sans text-xs select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-white font-bold">
          <FiUsers className="text-purple-400 text-sm" />
          <span>Real-Time Collaboration</span>
        </div>
        <CollaborationStatus />
      </div>

      {/* Share Session Card */}
      <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-200">Invite Team Members</span>
          <button
            onClick={openShareModal}
            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
          >
            <FiShare2 className="text-xs" />
            <span>Share Link</span>
          </button>
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Share your project link to edit code, view live cursors, and chat in real time.
        </p>
      </div>

      {/* User Identity Card */}
      <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          <span>Your Identity</span>
          {!isEditingName && (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-neutral-400 hover:text-purple-300 transition flex items-center gap-1 cursor-pointer"
            >
              <FiEdit2 className="text-[10px]" />
              <span>Edit Name</span>
            </button>
          )}
        </div>

        {isEditingName ? (
          <form onSubmit={handleSaveName} className="flex items-center gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-purple-500 font-mono"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold text-xs transition cursor-pointer"
            >
              <FiCheck />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: identity.avatarColor || "#3B82F6" }}
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white font-mono shadow-sm"
            >
              {identity.name ? identity.name.substring(0, 2).toUpperCase() : "U"}
            </div>
            <span className="font-semibold text-white truncate">{identity.name}</span>
          </div>
        )}
      </div>

      {/* Active Collaborators Roster */}
      <CollaboratorList />

      {/* Real-time Room Chat */}
      <CollaborationChat />
    </div>
  );
}
