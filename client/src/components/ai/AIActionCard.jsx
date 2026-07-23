import { motion } from "framer-motion";

export default function AIActionCard({
  title,
  description,
  icon: Icon,
  isSelected,
  isLoading,
  onClick,
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={isLoading}
      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3 group relative overflow-hidden ${
        isSelected
          ? "bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-500/10 text-white"
          : "bg-neutral-900/60 border-neutral-800 hover:border-purple-500/30 hover:bg-neutral-900/90 text-neutral-300"
      } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {/* Selection Glow Bar */}
      {isSelected && (
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-r"></span>
      )}

      {/* Action Icon */}
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
          isSelected
            ? "bg-purple-500 text-white shadow-md shadow-purple-500/30"
            : "bg-neutral-800 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300"
        }`}
      >
        <Icon className="text-lg" />
      </div>

      {/* Card Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-xs text-white tracking-wide mb-1 flex items-center justify-between">
          {title}
        </h3>
        <p className="text-[11px] text-neutral-400 leading-snug group-hover:text-neutral-300 transition-colors line-clamp-2">
          {description}
        </p>
      </div>
    </motion.button>
  );
}
