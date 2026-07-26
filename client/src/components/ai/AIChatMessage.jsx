import { useState } from "react";
import { FiUser, FiCpu, FiCopy, FiCheck, FiDownload, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { motion } from "framer-motion";

export default function AIChatMessage({ message }) {
  const isUser = message.sender === "user";
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleCopyCodeBlock = (codeText, index) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadCode = (codeText, lang) => {
    const extMap = {
      javascript: "js",
      python: "py",
      cpp: "cpp",
      c: "c",
      java: "java",
      html: "html",
      css: "css",
      json: "json",
    };
    const ext = extMap[lang.toLowerCase()] || "txt";
    const blob = new Blob([codeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `snippet.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Inline formatting helper for `code`, **bold**, *italic*
  const formatInlineStyles = (text) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 bg-neutral-950 text-purple-300 border border-neutral-800 rounded font-mono text-[11px]"
          >
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

  const renderFormattedMarkdown = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        const lines = part.split("\n");
        const lang = lines[0].replace("```", "").trim() || "code";
        const codeText = lines.slice(1, lines.length - 1).join("\n");
        const isExpanded = expandedIndex === index;

        return (
          <div
            key={index}
            className={`my-2 rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden font-mono text-xs shadow-md transition-all ${
              isExpanded ? "ring-1 ring-purple-500/50" : ""
            }`}
          >
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400">
              <span className="font-semibold text-purple-400 uppercase tracking-wider">
                {lang}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopyCodeBlock(codeText, index)}
                  className="hover:text-white transition flex items-center gap-1 cursor-pointer font-sans px-1.5 py-0.5 rounded hover:bg-neutral-800"
                  title="Copy code"
                >
                  {copiedIndex === index ? (
                    <FiCheck className="text-emerald-400" />
                  ) : (
                    <FiCopy />
                  )}
                  <span>{copiedIndex === index ? "Copied" : "Copy"}</span>
                </button>

                <button
                  onClick={() => handleDownloadCode(codeText, lang)}
                  className="hover:text-white transition flex items-center gap-1 cursor-pointer font-sans px-1.5 py-0.5 rounded hover:bg-neutral-800"
                  title="Download snippet file"
                >
                  <FiDownload />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className="hover:text-white transition flex items-center gap-1 cursor-pointer font-sans px-1.5 py-0.5 rounded hover:bg-neutral-800"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
                </button>
              </div>
            </div>

            <pre
              className={`p-2.5 overflow-x-auto text-neutral-200 leading-relaxed font-mono ${
                isExpanded ? "max-h-[450px]" : "max-h-60"
              }`}
            >
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      const lines = part.split("\n");
      const elements = [];

      lines.forEach((line, lIdx) => {
        if (line.startsWith("# ")) {
          elements.push(
            <h1 key={lIdx} className="font-extrabold text-sm text-white pt-2 pb-1">
              {line.replace("# ", "")}
            </h1>
          );
          return;
        }
        if (line.startsWith("## ")) {
          elements.push(
            <h2 key={lIdx} className="font-bold text-xs text-purple-200 pt-1.5 pb-0.5">
              {line.replace("## ", "")}
            </h2>
          );
          return;
        }
        if (line.startsWith("### ")) {
          elements.push(
            <h3 key={lIdx} className="font-semibold text-xs text-purple-400 pt-1">
              {line.replace("### ", "")}
            </h3>
          );
          return;
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          elements.push(
            <li key={lIdx} className="ml-3 list-disc text-neutral-300 py-0.5">
              {formatInlineStyles(line.replace(/^([-*]\s*)/, ""))}
            </li>
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

      return (
        <div key={index} className="space-y-1 text-xs leading-relaxed">
          {elements}
        </div>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2.5 my-2.5 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 shadow-md ${
          isUser
            ? "bg-purple-600 text-white"
            : "bg-purple-500/10 border border-purple-500/30 text-purple-400"
        }`}
      >
        {isUser ? <FiUser /> : <FiCpu />}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs ${
          isUser
            ? "bg-purple-600 text-white rounded-tr-none shadow-md shadow-purple-600/10 font-sans"
            : "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none shadow-md"
        }`}
      >
        <div className="flex items-center justify-between gap-3 pb-1 border-b border-white/10 mb-1.5 text-[10px] opacity-75">
          <span className="font-semibold">{isUser ? "You" : "Pix AI"}</span>
          <span>{message.timestamp}</span>
        </div>

        <div className="leading-relaxed">
          {renderFormattedMarkdown(message.text)}
        </div>
      </div>
    </motion.div>
  );
}
