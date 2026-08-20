import { useState } from "react";
import { FiClock, FiChevronDown, FiChevronRight } from "react-icons/fi";
import useGitStore from "../../store/gitStore";
import FileIcon from "../ide/FileIcon";

export default function GitCommitHistory() {
  const { commitHistory, openDiff } = useGitStore();
  const [expandedCommitHash, setExpandedCommitHash] = useState(null);

  const toggleExpand = (hash) => {
    setExpandedCommitHash(expandedCommitHash === hash ? null : hash);
  };

  return (
    <div className="flex flex-col space-y-2 mt-3 pt-3 border-t border-neutral-800 font-sans">
      <div className="flex items-center justify-between pb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <FiClock className="text-purple-400 text-xs" />
          Commit History ({commitHistory.length})
        </span>
      </div>

      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        {commitHistory.length === 0 ? (
          <div className="text-[11px] text-neutral-500 italic px-1 py-1">
            No commits recorded yet.
          </div>
        ) : (
          commitHistory.map((c) => {
            const isExpanded = expandedCommitHash === c.hash;
            return (
              <div
                key={c.hash}
                className="rounded-lg border border-neutral-800 bg-neutral-900/40 overflow-hidden text-xs"
              >
                <div
                  onClick={() => toggleExpand(c.hash)}
                  className="p-2 hover:bg-neutral-800/60 transition cursor-pointer flex items-start gap-2"
                >
                  <div className="mt-0.5 text-neutral-400 shrink-0">
                    {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-neutral-200 truncate" title={c.message}>
                        {c.message}
                      </span>
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded shrink-0 border border-purple-500/20">
                        {c.shortHash}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                      <span className="truncate max-w-[120px]">{c.author}</span>
                      <span className="shrink-0">{c.relativeTime}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Changed Files List */}
                {isExpanded && c.files && c.files.length > 0 && (
                  <div className="px-3 py-2 bg-neutral-950/80 border-t border-neutral-800/80 space-y-1">
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                      Changed Files ({c.files.length})
                    </span>
                    {c.files.map((f, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          openDiff({
                            path: f.name,
                            name: f.name,
                            language: f.name.split(".").pop() || "plaintext",
                          })
                        }
                        className="flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-neutral-800/60 cursor-pointer text-[11px] font-mono text-neutral-300 transition"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <FileIcon filename={f.name} className="w-3 h-3" />
                          <span className="truncate">{f.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400">
                          {f.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
