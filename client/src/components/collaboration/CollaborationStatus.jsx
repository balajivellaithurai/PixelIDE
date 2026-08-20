import useCollaborationStore from "../../collaboration/collaborationStore";

export default function CollaborationStatus() {
  const { connectionStatus, presenceList } = useCollaborationStore();

  if (connectionStatus === "connected") {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono select-none"
        title={`Connected to Real-time Collaboration (${presenceList.length} active users)`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-emerald-400">Connected</span>
        {presenceList.length > 1 && (
          <span className="text-[10px] bg-emerald-900/60 text-emerald-200 px-1.5 py-0.2 rounded-full font-bold ml-0.5">
            {presenceList.length}
          </span>
        )}
      </div>
    );
  }

  if (connectionStatus === "connecting") {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono select-none"
        title="Connecting to collaboration server..."
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span className="font-medium">Connecting...</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-mono select-none opacity-80"
      title="Disconnected from server. Local editing active."
    >
      <span className="w-2 h-2 rounded-full bg-red-500" />
      <span>Disconnected</span>
    </div>
  );
}
