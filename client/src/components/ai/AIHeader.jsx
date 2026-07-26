import { FiCpu, FiX, FiClock, FiGrid, FiMessageSquare } from "react-icons/fi";
import useAIStore from "../../store/aiStore";

export default function AIHeader() {
  const { closeSidebar, activeTab, setActiveTab, history } = useAIStore();

  return (
    <div
      style={{
        borderColor: "var(--border-color)",
      }}
      className="p-3.5 border-b flex flex-col gap-3 bg-neutral-900/60 backdrop-blur-sm"
    >
      {/* Title & Close Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md shadow-purple-500/10">
            <FiCpu className="text-lg" />
          </div>
          <div>
            <h2 className="font-bold text-xs text-white tracking-tight flex items-center gap-1.5">
              Pix AI Intelligence
              <span className="px-1 py-0.2 text-[9px] font-semibold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                IDE
              </span>
            </h2>
            <p className="text-[10px] text-neutral-400">Workspace Context Engine</p>
          </div>
        </div>

        {/* Close Sidebar Button */}
        <button
          onClick={closeSidebar}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          title="Close AI Assistant"
        >
          <FiX className="text-base" />
        </button>
      </div>

      {/* Tab Navigation Segmented Control */}
      <div className="grid grid-cols-3 p-1 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-medium">
        <button
          onClick={() => setActiveTab("tools")}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "tools"
              ? "bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/20"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <FiGrid className="text-xs" />
          <span>Tools</span>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "chat"
              ? "bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/20"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <FiMessageSquare className="text-xs" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
            activeTab === "history"
              ? "bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/20"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <FiClock className="text-xs" />
          <span>History</span>
          {history.length > 0 && activeTab !== "history" && (
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"></span>
          )}
        </button>
      </div>
    </div>
  );
}
