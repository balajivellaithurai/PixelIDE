import { useState } from "react";
import { FiCopy, FiCheck, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";
import useAIStore from "../../store/aiStore";

export default function AIResponse() {
  const { response, currentAction, clearResponse } = useAIStore();
  const [copied, setCopied] = useState(false);

  if (!response) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to parse markdown content into structured blocks (headers, bullets, code blocks)
  const renderFormattedMarkdown = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        const lines = part.split("\n");
        const lang = lines[0].replace("```", "").trim() || "code";
        const codeText = lines.slice(1, lines.length - 1).join("\n");

        return (
          <div
            key={index}
            className="my-3 rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden font-mono text-xs shadow-lg"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-[11px] text-neutral-400">
              <span className="font-semibold text-purple-400 uppercase tracking-wider text-[10px]">
                {lang}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codeText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-neutral-200 leading-relaxed font-mono">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Format headers, bold text, bullets for normal text parts
      return (
        <div key={index} className="space-y-2 text-xs text-neutral-300 leading-relaxed">
          {part.split("\n").map((line, lIdx) => {
            if (line.startsWith("### ")) {
              return (
                <h3 key={lIdx} className="font-bold text-sm text-white pt-2 pb-1">
                  {line.replace("### ", "")}
                </h3>
              );
            }
            if (line.startsWith("#### ")) {
              return (
                <h4 key={lIdx} className="font-semibold text-xs text-purple-300 pt-1">
                  {line.replace("#### ", "")}
                </h4>
              );
            }
            if (line.startsWith("• ") || line.startsWith("- ")) {
              return (
                <li key={lIdx} className="ml-4 list-disc text-neutral-300">
                  {line.replace(/^([•\-]\s*)/, "")}
                </li>
              );
            }
            if (line.trim() === "") return <div key={lIdx} className="h-1"></div>;
            return <p key={lIdx}>{line}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 flex flex-col h-full"
    >
      {/* Top Response Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
        <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
          {currentAction ? `${currentAction} Response` : "AI Output"}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-2 py-1 text-[11px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
            title="Copy all response"
          >
            {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            onClick={clearResponse}
            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
            title="Clear response"
          >
            <FiRefreshCw className="text-xs" />
          </button>
        </div>
      </div>

      {/* Formatted Markdown Body */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {renderFormattedMarkdown(response)}
      </div>
    </motion.div>
  );
}
