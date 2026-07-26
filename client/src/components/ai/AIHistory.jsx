import { FiClock, FiFileText, FiTrash2, FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";
import useAIStore from "../../store/aiStore";

export default function AIHistory() {
  const { history, restoreHistoryItem, clearHistory, setShowHistoryView } =
    useAIStore();

  if (!history || history.length === 0) {
    return (
      <div className="p-6 text-center text-neutral-400 my-auto flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xl mb-3">
          <FiClock />
        </div>
        <h3 className="font-semibold text-sm text-neutral-200 mb-1">
          No AI History Yet
        </h3>
        <p className="text-xs text-neutral-400 max-w-xs leading-relaxed mb-4">
          Execute AI actions to record session responses here.
        </p>
        <button
          onClick={() => setShowHistoryView(false)}
          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium cursor-pointer"
        >
          Back to AI Tools
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 flex flex-col h-full space-y-3"
    >
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
          <FiClock className="text-xs" />
          Session History ({history.length})
        </span>
        <button
          onClick={clearHistory}
          className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition px-2 py-0.5 rounded hover:bg-neutral-800"
          title="Clear session history"
        >
          <FiTrash2 />
          <span>Clear</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => restoreHistoryItem(item)}
            className="w-full text-left p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-purple-500/50 hover:bg-neutral-850 transition-all cursor-pointer group flex items-start justify-between gap-2 shadow-sm"
          >
            <div className="space-y-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                  {item.action || "AI Action"}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                  {item.language || "code"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-sans">
                <span className="flex items-center gap-1 truncate max-w-[150px]">
                  <FiFileText className="text-neutral-500 shrink-0" />
                  <span className="truncate">{item.filename || "file"}</span>
                </span>
                <span>•</span>
                <span>{item.timestamp}</span>
              </div>
              <p className="text-[11px] text-neutral-400 truncate max-w-[260px] italic">
                {item.response ? item.response.slice(0, 80) + "..." : ""}
              </p>
            </div>
            <FiChevronRight className="text-neutral-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
