import { motion, AnimatePresence } from "framer-motion";
import AIHeader from "./AIHeader";
import AIActions from "./AIActions";
import AILoading from "./AILoading";
import AIResponse from "./AIResponse";
import AIEmptyState from "./AIEmptyState";
import useAIStore from "../../store/aiStore";

export default function AISidebar() {
  const { isOpen, isLoading, response } = useAIStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          style={{
            backgroundColor: "var(--bg-sidebar)",
            borderColor: "var(--border-color)",
          }}
          className="w-96 border-l flex flex-col h-full z-30 shrink-0 shadow-2xl transition-colors duration-200"
        >
          {/* Header */}
          <AIHeader />

          {/* Scrollable Main Body */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Actions Grid */}
            <AIActions />

            {/* Divider */}
            <div className="px-4 my-2">
              <div className="border-t border-neutral-800" />
            </div>

            {/* Response / Loading / Empty State Panel */}
            <div className="flex-1 flex flex-col min-h-[220px]">
              {isLoading ? (
                <AILoading />
              ) : response ? (
                <AIResponse />
              ) : (
                <AIEmptyState />
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
