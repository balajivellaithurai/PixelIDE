import { useMemo } from "react";
import { FiSearch, FiRepeat } from "react-icons/fi";
import useWorkspaceStore from "../../store/workspaceStore";
import useIDEStore from "../../store/ideStore";
import monacoService from "../../services/monacoService";
import FileIcon from "./FileIcon";

export default function GlobalSearchPanel() {
  const { files, setActiveFile, updateFileContent } = useWorkspaceStore();
  const {
    globalSearchQuery,
    setGlobalSearchQuery,
    globalReplaceQuery,
    setGlobalReplaceQuery,
  } = useIDEStore();

  // Search matches across all files
  const searchResults = useMemo(() => {
    if (!globalSearchQuery || !globalSearchQuery.trim()) return [];

    const query = globalSearchQuery.toLowerCase();
    const results = [];

    files.forEach((file) => {
      if (!file.content) return;
      const lines = file.content.split("\n");
      const fileMatches = [];

      lines.forEach((lineText, index) => {
        if (lineText.toLowerCase().includes(query)) {
          fileMatches.push({
            line: index + 1,
            content: lineText.trim(),
            fileId: file.id,
            fileName: file.name,
          });
        }
      });

      if (fileMatches.length > 0) {
        results.push({
          fileId: file.id,
          fileName: file.name,
          language: file.language,
          matches: fileMatches,
        });
      }
    });

    return results;
  }, [files, globalSearchQuery]);

  const totalMatches = searchResults.reduce(
    (acc, curr) => acc + curr.matches.length,
    0
  );

  const handleMatchClick = (fileId, line) => {
    setActiveFile(fileId);
    setTimeout(() => {
      monacoService.jumpToLine(line);
    }, 50);
  };

  const handleReplaceAll = () => {
    if (!globalSearchQuery || !globalSearchQuery.trim()) return;

    files.forEach((file) => {
      if (!file.content) return;
      const regex = new RegExp(
        globalSearchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      );
      if (regex.test(file.content)) {
        const newContent = file.content.replace(regex, globalReplaceQuery);
        updateFileContent(file.id, newContent);
      }
    });
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <FiSearch className="text-purple-400 text-xs" />
          Search & Replace
        </span>
        {totalMatches > 0 && (
          <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 font-mono">
            {totalMatches} match{totalMatches === 1 ? "" : "es"}
          </span>
        )}
      </div>

      {/* Input Controls */}
      <div className="space-y-2">
        {/* Search Input */}
        <div className="relative flex items-center">
          <input
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Search across all files (Ctrl+Shift+F)"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Replace Input */}
        <div className="flex items-center gap-1.5">
          <input
            value={globalReplaceQuery}
            onChange={(e) => setGlobalReplaceQuery(e.target.value)}
            placeholder="Replace with..."
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50"
          />
          <button
            onClick={handleReplaceAll}
            disabled={!globalSearchQuery.trim() || totalMatches === 0}
            className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium cursor-pointer disabled:opacity-40 transition flex items-center gap-1 shrink-0"
            title="Replace All across workspace"
          >
            <FiRepeat className="text-xs" />
            <span>Replace All</span>
          </button>
        </div>
      </div>

      {/* Search Results Area */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {!globalSearchQuery.trim() ? (
          <div className="p-4 text-center text-neutral-500 text-xs italic my-auto">
            Type a query above to search all workspace files.
          </div>
        ) : searchResults.length === 0 ? (
          <div className="p-4 text-center text-neutral-500 text-xs italic my-auto">
            No matches found for "{globalSearchQuery}".
          </div>
        ) : (
          searchResults.map((fileGroup) => (
            <div
              key={fileGroup.fileId}
              className="rounded-lg border border-neutral-800/80 bg-neutral-900/40 overflow-hidden"
            >
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-neutral-900 border-b border-neutral-800 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-neutral-200">
                  <FileIcon filename={fileGroup.fileName} className="w-3.5 h-3.5" />
                  <span>{fileGroup.fileName}</span>
                </div>
                <span className="text-[10px] text-purple-400 font-mono">
                  {fileGroup.matches.length}
                </span>
              </div>

              <div className="divide-y divide-neutral-800/40">
                {fileGroup.matches.map((match, mIdx) => (
                  <button
                    key={`${match.fileId}-${match.line}-${mIdx}`}
                    onClick={() => handleMatchClick(match.fileId, match.line)}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-800/60 transition flex items-center gap-2 font-mono text-[11px] cursor-pointer group"
                  >
                    <span className="text-neutral-500 shrink-0">L{match.line}</span>
                    <span className="text-neutral-300 group-hover:text-purple-300 transition truncate">
                      {match.content}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
