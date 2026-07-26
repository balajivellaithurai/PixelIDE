import { FiChevronRight, FiFolder } from "react-icons/fi";
import useWorkspaceStore from "../../store/workspaceStore";
import useIDEStore from "../../store/ideStore";
import FileIcon from "./FileIcon";

export default function BreadcrumbBar() {
  const { files, activeFileId } = useWorkspaceStore();
  const { currentSymbol } = useIDEStore();

  const activeFile = files.find((f) => f.id === activeFileId);
  if (!activeFile) return null;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900/60 border-b border-neutral-800/80 text-[11px] text-neutral-400 font-sans shrink-0 select-none overflow-x-auto">
      {/* Workspace Root */}
      <span className="flex items-center gap-1 hover:text-white transition cursor-pointer">
        <FiFolder className="text-purple-400 text-xs" />
        <span>Pix Workspace</span>
      </span>

      <FiChevronRight className="text-neutral-600 text-xs shrink-0" />

      {/* File Name */}
      <span className="flex items-center gap-1.5 hover:text-white transition cursor-pointer font-medium text-neutral-300">
        <FileIcon filename={activeFile.name} className="w-3.5 h-3.5" />
        <span>{activeFile.name}</span>
      </span>

      {/* Active Symbol (if present) */}
      {currentSymbol && (
        <>
          <FiChevronRight className="text-neutral-600 text-xs shrink-0" />
          <span className="text-purple-300 font-mono bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20">
            {currentSymbol}
          </span>
        </>
      )}
    </div>
  );
}
