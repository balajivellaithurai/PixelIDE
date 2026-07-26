import { useMemo } from "react";
import { FiBox, FiCode, FiLayers, FiList } from "react-icons/fi";
import useWorkspaceStore from "../../store/workspaceStore";
import useEditorStore from "../../store/editorStore";
import useIDEStore from "../../store/ideStore";
import monacoService from "../../services/monacoService";
import { parseFileOutline } from "../../services/outlineParser";

export default function OutlinePanel() {
  const { files, activeFileId } = useWorkspaceStore();
  const { code, language } = useEditorStore();
  const { setCurrentSymbol } = useIDEStore();

  const activeFile = files.find((f) => f.id === activeFileId);

  const symbols = useMemo(() => {
    return parseFileOutline(code, activeFile?.language || language || "javascript");
  }, [code, activeFile?.language, language]);

  const handleSymbolClick = (symbol) => {
    setCurrentSymbol(symbol.name);
    monacoService.jumpToLine(symbol.line, symbol.column);
  };

  const getSymbolIcon = (type) => {
    switch (type) {
      case "class":
        return <FiBox className="text-purple-400 shrink-0 text-xs" />;
      case "function":
        return <FiCode className="text-blue-400 shrink-0 text-xs" />;
      case "variable":
        return <FiLayers className="text-amber-400 shrink-0 text-xs" />;
      default:
        return <FiList className="text-neutral-400 shrink-0 text-xs" />;
    }
  };

  if (!activeFile) return null;

  return (
    <div className="flex flex-col h-full space-y-2">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <FiList className="text-purple-400 text-xs" />
          Outline ({symbols.length})
        </span>
        <span className="text-[10px] text-neutral-500 font-mono">
          {activeFile.name}
        </span>
      </div>

      {symbols.length === 0 ? (
        <div className="p-4 text-center text-neutral-500 text-xs italic my-auto">
          No classes, functions, or variables detected in file.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {symbols.map((symbol, idx) => (
            <button
              key={`${symbol.name}-${symbol.line}-${idx}`}
              onClick={() => handleSymbolClick(symbol)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-800/80 transition flex items-center justify-between gap-2 text-xs font-mono group cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                {getSymbolIcon(symbol.type)}
                <span className="text-neutral-200 group-hover:text-purple-300 transition truncate">
                  {symbol.name}
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 font-sans shrink-0">
                L{symbol.line}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
