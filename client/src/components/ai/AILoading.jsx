import { motion } from "framer-motion";
import { FiZap } from "react-icons/fi";
import useAIStore, { AIActionType } from "../../store/aiStore";

const ACTION_LOADING_LABELS = {
  [AIActionType.REVIEW]: "Reviewing your code...",
  [AIActionType.DEBUG]: "Diagnosing potential errors...",
  [AIActionType.EXPLAIN]: "Analyzing code structure...",
  [AIActionType.OPTIMIZE]: "Calculating optimizations...",
  [AIActionType.TESTS]: "Generating unit tests...",
  [AIActionType.DOCS]: "Generating documentation...",
  [AIActionType.INTERVIEW]: "Evaluating solution...",
};

export default function AILoading() {
  const currentAction = useAIStore((state) => state.currentAction);
  const label =
    ACTION_LOADING_LABELS[currentAction] || "Analyzing with AI...";

  return (
    <div className="p-4 space-y-4">
      {/* Action Header Status */}
      <div className="flex items-center gap-2.5 text-xs text-purple-400 font-medium">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <FiZap className="text-sm" />
        </motion.div>
        <span>{label}</span>
      </div>

      {/* Skeleton Blocks */}
      <div className="space-y-3">
        {/* Skeleton Line 1 */}
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="h-4 bg-purple-900/30 rounded-md w-3/4 border border-purple-500/10"
        />

        {/* Skeleton Line 2 */}
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.2, ease: "easeInOut" }}
          className="h-3 bg-neutral-800 rounded-md w-full"
        />

        {/* Skeleton Line 3 */}
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.4, ease: "easeInOut" }}
          className="h-3 bg-neutral-800 rounded-md w-5/6"
        />

        {/* Code Block Skeleton */}
        <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-2 mt-4">
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.1, ease: "easeInOut" }}
            className="h-3.5 bg-purple-500/20 rounded w-1/2"
          />
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.3, ease: "easeInOut" }}
            className="h-3 bg-neutral-800 rounded w-2/3"
          />
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.5, ease: "easeInOut" }}
            className="h-3 bg-neutral-800 rounded w-4/5"
          />
        </div>
      </div>
    </div>
  );
}
