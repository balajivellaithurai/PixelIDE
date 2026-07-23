import { useState } from "react";
import { FiCopy, FiCheck, FiRefreshCw, FiAlertTriangle, FiCode } from "react-icons/fi";
import { motion } from "framer-motion";
import useAIStore from "../../store/aiStore";
import aiService from "../../services/aiService";
import { AIErrorType } from "../../ai/errors/aiErrors";

export default function AIResponse() {
  const { response, error, currentAction, clearResponse, isLoading } = useAIStore();
  const [copied, setCopied] = useState(false);

  // 1. Error View with Retry Button or Empty Editor Message
  if (error) {
    const isEmptyRequest = error.type === AIErrorType.EMPTY_REQUEST;

    if (isEmptyRequest) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 text-center my-auto flex flex-col items-center justify-center text-neutral-400"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-2xl mb-3 shadow-lg shadow-purple-500/5">
            <FiCode />
          </div>
          <h3 className="font-semibold text-sm text-neutral-200 mb-1">
            Start writing code before using AI.
          </h3>
          <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
            Open or write code in the editor, then select an action to analyze your code.
          </p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 my-auto flex flex-col items-center text-center space-y-3"
      >
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-xl shadow-lg shadow-red-500/10">
          <FiAlertTriangle />
        </div>
        <div>
          <h3 className="font-bold text-sm text-red-200 mb-1">
            Something went wrong.
          </h3>
          <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
            {error.message || "An unexpected error occurred while communicating with the AI service."}
          </p>
        </div>

        <button
          onClick={() => aiService.retryLastRequest()}
          disabled={isLoading}
          className="mt-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-medium transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
          <span>{isLoading ? "Retrying..." : "Retry"}</span>
        </button>
      </motion.div>
    );
  }

  if (!response) return null;

  const handleCopyAll = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parses markdown text into formatted blocks (headers, lists, tables, blockquotes, code blocks)
  const renderFormattedMarkdown = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // Fenced Code Block
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
                className="hover:text-white transition flex items-center gap-1 cursor-pointer font-sans"
              >
                {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                <span>{copied ? "Copied" : "Copy Code"}</span>
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-neutral-200 leading-relaxed font-mono selection:bg-purple-500/30">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Normal Text Processing (Headers, Bullet lists, Numbered lists, Blockquotes, Tables)
      const lines = part.split("\n");
      const elements = [];
      let inTable = false;
      let tableHeader = null;
      let tableRows = [];

      lines.forEach((line, lIdx) => {
        // Table Detector
        if (line.includes("|") && line.trim().startsWith("|") && line.trim().endsWith("|")) {
          if (!inTable) {
            inTable = true;
            tableHeader = line.split("|").filter((c) => c.trim() !== "").map((c) => c.trim());
          } else if (line.includes("---")) {
            // Divider line, skip
          } else {
            tableRows.push(line.split("|").filter((c) => c.trim() !== "").map((c) => c.trim()));
          }
          return;
        } else if (inTable) {
          // Render accumulated table
          elements.push(
            <div key={`tbl-${lIdx}`} className="my-3 overflow-x-auto rounded-lg border border-neutral-800">
              <table className="w-full text-left text-xs">
                {tableHeader && (
                  <thead className="bg-neutral-900 border-b border-neutral-800 text-purple-300">
                    <tr>
                      {tableHeader.map((h, hIdx) => (
                        <th key={hIdx} className="p-2 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {tableRows.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2 text-neutral-300">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          inTable = false;
          tableHeader = null;
          tableRows = [];
        }

        // Headings
        if (line.startsWith("# ")) {
          elements.push(<h1 key={lIdx} className="font-extrabold text-base text-white pt-3 pb-1">{line.replace("# ", "")}</h1>);
          return;
        }
        if (line.startsWith("## ")) {
          elements.push(<h2 key={lIdx} className="font-bold text-sm text-purple-200 pt-2 pb-1 border-b border-neutral-800">{line.replace("## ", "")}</h2>);
          return;
        }
        if (line.startsWith("### ")) {
          elements.push(<h3 key={lIdx} className="font-bold text-xs text-purple-400 pt-2 pb-0.5">{line.replace("### ", "")}</h3>);
          return;
        }
        if (line.startsWith("#### ")) {
          elements.push(<h4 key={lIdx} className="font-semibold text-xs text-neutral-200 pt-1">{line.replace("#### ", "")}</h4>);
          return;
        }

        // Blockquote
        if (line.startsWith("> ")) {
          elements.push(
            <blockquote key={lIdx} className="my-1.5 pl-3 border-l-2 border-purple-500 text-neutral-400 italic">
              {line.replace("> ", "")}
            </blockquote>
          );
          return;
        }

        // Bullet lists
        if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
          elements.push(
            <li key={lIdx} className="ml-4 list-disc text-neutral-300 py-0.5">
              {formatInlineStyles(line.replace(/^([•\-\*]\s*)/, ""))}
            </li>
          );
          return;
        }

        // Numbered list
        if (/^\d+\.\s/.test(line)) {
          elements.push(
            <div key={lIdx} className="ml-2 font-medium text-neutral-300 py-0.5">
              {formatInlineStyles(line)}
            </div>
          );
          return;
        }

        if (line.trim() === "") {
          elements.push(<div key={lIdx} className="h-1"></div>);
          return;
        }

        elements.push(
          <p key={lIdx} className="text-neutral-300">
            {formatInlineStyles(line)}
          </p>
        );
      });

      return <div key={index} className="space-y-1 text-xs leading-relaxed">{elements}</div>;
    });
  };

  // Inline formatting helper for `code`, **bold**, *italic*
  const formatInlineStyles = (text) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1.5 py-0.5 bg-neutral-900 text-purple-300 border border-neutral-800 rounded font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
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
        <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          {currentAction ? `${currentAction} Response` : "AI Output"}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="px-2 py-1 text-[11px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
            title="Copy all response text"
          >
            {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
            <span>{copied ? "Copied" : "Copy All"}</span>
          </button>
          <button
            onClick={clearResponse}
            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
            title="Clear output"
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
