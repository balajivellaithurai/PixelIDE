import { FiFolder, FiSearch, FiList, FiGitBranch, FiChevronLeft } from "react-icons/fi";
import FileExplorer from "./FileExplorer";
import GlobalSearchPanel from "../ide/GlobalSearchPanel";
import OutlinePanel from "../ide/OutlinePanel";
import GitPanel from "../git/GitPanel";
import useIDEStore from "../../store/ideStore";

export default function Sidebar() {
  const {
    activeSidebarTab,
    setActiveSidebarTab,
    sidebarCollapsed,
    toggleSidebarCollapsed,
    sidebarWidth,
  } = useIDEStore();

  if (sidebarCollapsed) {
    return (
      <aside
        style={{
          backgroundColor: "var(--bg-sidebar)",
          borderColor: "var(--border-color)",
        }}
        className="w-12 border-r flex flex-col items-center py-3 space-y-3 transition-colors duration-200 select-none z-10 shrink-0"
      >
        <button
          onClick={() => setActiveSidebarTab("explorer")}
          className={`p-2 rounded-lg transition cursor-pointer ${
            activeSidebarTab === "explorer"
              ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
              : "text-neutral-400 hover:text-white"
          }`}
          title="File Explorer"
        >
          <FiFolder className="text-base" />
        </button>

        <button
          onClick={() => setActiveSidebarTab("git")}
          className={`p-2 rounded-lg transition cursor-pointer ${
            activeSidebarTab === "git"
              ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
              : "text-neutral-400 hover:text-white"
          }`}
          title="Source Control (Git)"
        >
          <FiGitBranch className="text-base" />
        </button>

        <button
          onClick={() => setActiveSidebarTab("search")}
          className={`p-2 rounded-lg transition cursor-pointer ${
            activeSidebarTab === "search"
              ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
              : "text-neutral-400 hover:text-white"
          }`}
          title="Global Search & Replace (Ctrl+Shift+F)"
        >
          <FiSearch className="text-base" />
        </button>

        <button
          onClick={() => setActiveSidebarTab("outline")}
          className={`p-2 rounded-lg transition cursor-pointer ${
            activeSidebarTab === "outline"
              ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
              : "text-neutral-400 hover:text-white"
          }`}
          title="Outline Explorer"
        >
          <FiList className="text-base" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      style={{
        backgroundColor: "var(--bg-sidebar)",
        borderColor: "var(--border-color)",
        width: `${sidebarWidth}px`,
      }}
      className="border-r flex flex-col transition-colors duration-200 z-10 shrink-0 select-none"
    >
      {/* Top Segmented Icon Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800/80 bg-neutral-900/40">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSidebarTab("explorer")}
            className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs ${
              activeSidebarTab === "explorer"
                ? "bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold"
                : "text-neutral-400 hover:text-white"
            }`}
            title="File Explorer"
          >
            <FiFolder className="text-xs" />
            <span>Files</span>
          </button>

          <button
            onClick={() => setActiveSidebarTab("git")}
            className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs ${
              activeSidebarTab === "git"
                ? "bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold"
                : "text-neutral-400 hover:text-white"
            }`}
            title="Source Control (Git)"
          >
            <FiGitBranch className="text-xs" />
            <span>Git</span>
          </button>

          <button
            onClick={() => setActiveSidebarTab("search")}
            className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs ${
              activeSidebarTab === "search"
                ? "bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold"
                : "text-neutral-400 hover:text-white"
            }`}
            title="Search (Ctrl+Shift+F)"
          >
            <FiSearch className="text-xs" />
            <span>Search</span>
          </button>

          <button
            onClick={() => setActiveSidebarTab("outline")}
            className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-xs ${
              activeSidebarTab === "outline"
                ? "bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold"
                : "text-neutral-400 hover:text-white"
            }`}
            title="Outline Explorer"
          >
            <FiList className="text-xs" />
            <span>Outline</span>
          </button>
        </div>

        <button
          onClick={toggleSidebarCollapsed}
          className="p-1 rounded text-neutral-400 hover:text-white transition cursor-pointer"
          title="Collapse Sidebar"
        >
          <FiChevronLeft className="text-sm" />
        </button>
      </div>

      {/* Main View Area */}
      <div className="flex-1 p-3.5 overflow-y-auto">
        {activeSidebarTab === "git" ? (
          <GitPanel />
        ) : activeSidebarTab === "search" ? (
          <GlobalSearchPanel />
        ) : activeSidebarTab === "outline" ? (
          <OutlinePanel />
        ) : (
          <FileExplorer />
        )}
      </div>
    </aside>
  );
}