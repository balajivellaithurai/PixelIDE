import { FiCpu, FiX, FiSettings } from "react-icons/fi";
import useAIStore from "../../store/aiStore";

export default function AIHeader() {
  const closeSidebar = useAIStore((state) => state.closeSidebar);

  return (
    <div
      style={{
        borderColor: "var(--border-color)",
      }}
      className="p-4 border-b flex items-center justify-between bg-neutral-900/50 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md shadow-purple-500/10">
          <FiCpu className="text-xl" />
        </div>
        <div>
          <h2 className="font-bold text-sm text-white tracking-tight flex items-center gap-2">
            AI Assistant
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
              PRO
            </span>
          </h2>
          <p className="text-xs text-neutral-400">Smart coding companion</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Placeholder for future Settings button */}
        <button
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition cursor-pointer"
          title="AI Settings (Coming soon)"
        >
          <FiSettings className="text-base" />
        </button>

        {/* Close Sidebar Button */}
        <button
          onClick={closeSidebar}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition cursor-pointer"
          title="Close AI Assistant"
        >
          <FiX className="text-lg" />
        </button>
      </div>
    </div>
  );
}
