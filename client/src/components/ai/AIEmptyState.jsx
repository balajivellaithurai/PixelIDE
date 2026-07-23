import { FiCpu } from "react-icons/fi";

export default function AIEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-400 my-auto">
      <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-purple-400 text-3xl mb-4 shadow-xl shadow-purple-500/5">
        <FiCpu />
      </div>
      <h3 className="font-semibold text-sm text-neutral-200 mb-1">
        Select an AI action to begin.
      </h3>
      <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
        Choose one of the tools above to review, debug, explain, optimize, or document your code.
      </p>
    </div>
  );
}
