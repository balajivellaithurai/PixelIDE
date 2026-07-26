import { FiCpu, FiX, FiClock } from "react-icons/fi";
import useAIStore from "../../store/aiStore";

export default function AIHeader() {
  const { closeSidebar, showHistoryView, toggleHistoryView, history } =
    useAIStore();

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
          <p className="text-xs text-neutral-400">Context-Aware AI IDE</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Toggle History View Button */}
        <button
          onClick={toggleHistoryView}
          className={`p-2 rounded-lg transition cursor-pointer relative ${
            showHistoryView
              ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/80"
          }`}
          title="Toggle Session AI History"
        >
          <FiClock className="text-base" />
          {history.length > 0 && !showHistoryView && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500"></span>
          )}
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
