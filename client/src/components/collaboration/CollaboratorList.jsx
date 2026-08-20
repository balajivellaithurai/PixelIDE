import useCollaborationStore from "../../collaboration/collaborationStore";
import FileIcon from "../ide/FileIcon";

export default function CollaboratorList() {
  const { presenceList, identity } = useCollaborationStore();

  if (!presenceList || presenceList.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-neutral-500 font-sans border border-dashed border-neutral-800 rounded-xl bg-neutral-950/40">
        No other collaborators connected. Share project link to invite others!
      </div>
    );
  }

  return (
    <div className="space-y-2 font-sans">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between px-1">
        <span>Active Collaborators</span>
        <span className="text-purple-400 font-mono text-xs">{presenceList.length}</span>
      </div>

      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {presenceList.map((user) => {
          const isSelf = user.userId === identity.id;
          const initials = user.name
            ? user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()
            : "U";

          return (
            <div
              key={user.socketId || user.userId}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                isSelf
                  ? "bg-purple-950/20 border-purple-500/30 text-purple-200"
                  : "bg-neutral-900/60 border-neutral-800 text-neutral-200 hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Avatar with initial & online indicator */}
                <div className="relative shrink-0">
                  <div
                    style={{ backgroundColor: user.avatarColor || "#3B82F6" }}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white shadow-sm font-mono"
                  >
                    {initials}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-neutral-900" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold truncate text-white">
                      {user.name}
                    </span>
                    {isSelf && (
                      <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1 py-0.2 rounded uppercase font-bold">
                        You
                      </span>
                    )}
                  </div>

                  {/* Active File Indicator */}
                  {user.activeFile && (
                    <div className="flex items-center gap-1 text-[10px] text-neutral-400 truncate mt-0.5">
                      <FileIcon filename={user.activeFile} className="w-3 h-3 shrink-0" />
                      <span className="truncate font-mono text-purple-300/80">
                        {user.activeFile}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
