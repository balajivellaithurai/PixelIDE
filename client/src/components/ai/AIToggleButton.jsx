import { motion } from "framer-motion";
import { FiCpu, FiChevronLeft } from "react-icons/fi";
import useAIStore from "../../store/aiStore";

export default function AIToggleButton() {
  const { isOpen, openSidebar } = useAIStore();

  if (isOpen) return null;

  return (
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.05, x: -3 }}
      whileTap={{ scale: 0.95 }}
      onClick={openSidebar}
      className="absolute right-0 top-1/2 -translate-y-1/2 z-40 px-2.5 py-3 rounded-l-xl bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-600/30 border-l border-t border-b border-purple-400/30 transition-colors cursor-pointer flex items-center gap-1.5 group"
      title="Open AI Assistant"
    >
      <FiChevronLeft className="text-sm group-hover:-translate-x-0.5 transition-transform" />
      <FiCpu className="text-lg" />
      <span className="text-xs font-semibold pr-1 hidden sm:inline">AI</span>
    </motion.button>
  );
}
