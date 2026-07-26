import { useState, useRef, useEffect } from "react";
import { FiSend, FiTrash2, FiZap, FiMessageSquare } from "react-icons/fi";
import { motion } from "framer-motion";
import useAIStore from "../../store/aiStore";
import aiService from "../../services/aiService";
import AIChatMessage from "./AIChatMessage";

const SUGGESTED_PROMPTS = [
  "Explain this project",
  "How can I optimize this?",
  "Find bugs",
  "Suggest architecture improvements",
  "Explain this function",
  "Improve performance",
];

export default function AIChatPanel() {
  const { chatHistory, isChatLoading, clearChat } = useAIStore();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat on new messages or loading state
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isChatLoading]);

  const handleSend = async (textToSend) => {
    const prompt = textToSend || inputText;
    if (!prompt || !prompt.trim() || isChatLoading) return;

    setInputText("");
    try {
      await aiService.sendChatMessage(prompt);
    } catch {
      // Error handled by store/service
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950/50">
      {/* Top Header / Clear Action */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/40">
        <div className="flex items-center gap-2">
          <FiMessageSquare className="text-purple-400 text-xs" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
            Workspace Chat
          </span>
        </div>
        <button
          onClick={clearChat}
          className="text-[10px] text-neutral-400 hover:text-red-400 flex items-center gap-1 cursor-pointer transition px-1.5 py-0.5 rounded hover:bg-neutral-800"
          title="Clear chat history"
        >
          <FiTrash2 className="text-xs" />
          <span>Clear</span>
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="p-3 border-b border-neutral-800/60 bg-neutral-900/20">
        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
          <FiZap className="text-purple-400 text-xs" />
          Suggested Prompts
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_PROMPTS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              disabled={isChatLoading}
              className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 hover:border-purple-500/40 hover:bg-purple-500/10 text-neutral-300 hover:text-purple-300 text-[10px] font-medium transition cursor-pointer disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-[180px]">
        {chatHistory.map((msg) => (
          <AIChatMessage key={msg.id} message={msg} />
        ))}

        {/* Loading Indicator */}
        {isChatLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-purple-400 text-xs py-2 px-3 bg-neutral-900/80 rounded-xl border border-neutral-800 w-fit"
          >
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></div>
            <span>Pix AI is analyzing workspace...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Box */}
      <div className="p-3 border-t border-neutral-800 bg-neutral-900/60">
        <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl p-1.5 focus-within:border-purple-500/50 transition">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your workspace..."
            rows={1}
            disabled={isChatLoading}
            className="flex-1 bg-transparent px-2 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none resize-none max-h-24 font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isChatLoading}
            className="w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-40 text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-md shadow-purple-600/20"
            title="Send Message (Enter)"
          >
            <FiSend className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
