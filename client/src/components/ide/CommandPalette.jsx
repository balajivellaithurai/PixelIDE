import { useState, useEffect, useRef } from "react";
import {
  FiSearch,
  FiPlay,
  FiCheckSquare,
  FiRefreshCcw,
  FiHelpCircle,
  FiFileText,
  FiLayers,
  FiAlertTriangle,
  FiBox,
  FiMessageSquare,
  FiMoon,
  FiSidebar,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import useIDEStore from "../../store/ideStore";
import useWorkspaceStore from "../../store/workspaceStore";
import useEditorStore from "../../store/editorStore";
import useThemeStore, { THEMES } from "../../store/themeStore";
import useAIStore from "../../store/aiStore";
import aiService from "../../services/aiService";

export default function CommandPalette() {
  const { isCommandPaletteOpen, closeCommandPalette, setActiveSidebarTab, toggleSidebarCollapsed } = useIDEStore();
  const { runCode } = useEditorStore();
  const { theme, setTheme } = useThemeStore();
  const { openSidebar, setActiveTab } = useAIStore();
  const { files, setActiveFile, setShowProjectModal, saveCurrentProject, exportAsZip, exportAsJson } = useWorkspaceStore();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const COMMANDS = [
    {
      id: "project-manager",
      title: "Project Manager (New, Recent, Import/Export)",
      category: "Project",
      icon: FiBox,
      action: () => setShowProjectModal(true),
    },
    {
      id: "save-project",
      title: "Save Project",
      category: "Project",
      icon: FiFileText,
      action: () => saveCurrentProject(),
    },
    {
      id: "export-zip",
      title: "Export Project ZIP Archive",
      category: "Project",
      icon: FiBox,
      action: () => exportAsZip(),
    },
    {
      id: "export-json",
      title: "Export Project Metadata (.pixproject)",
      category: "Project",
      icon: FiFileText,
      action: () => exportAsJson(),
    },
    {
      id: "run-code",
      title: "Run Code",
      category: "Execution",
      icon: FiPlay,
      action: () => runCode(),
    },
    {
      id: "ai-chat",
      title: "AI Workspace Chat",
      category: "AI",
      icon: FiMessageSquare,
      action: () => {
        openSidebar();
        setActiveTab("chat");
      },
    },
    {
      id: "review-code",
      title: "Review Code",
      category: "AI Tools",
      icon: FiCheckSquare,
      action: () => aiService.reviewCode(),
    },
    {
      id: "refactor-code",
      title: "Refactor Code",
      category: "AI Tools",
      icon: FiRefreshCcw,
      action: () => aiService.refactorCode(),
    },
    {
      id: "explain-code",
      title: "Explain Selection",
      category: "AI Tools",
      icon: FiHelpCircle,
      action: () => aiService.explainSelection(),
    },
    {
      id: "fix-bug",
      title: "Fix Bug",
      category: "AI Tools",
      icon: FiAlertTriangle,
      action: () => aiService.fixBug(),
    },
    {
      id: "generate-docs",
      title: "Generate Documentation",
      category: "AI Tools",
      icon: FiFileText,
      action: () => aiService.generateDocs(),
    },
    {
      id: "generate-tests",
      title: "Generate Tests",
      category: "AI Tools",
      icon: FiLayers,
      action: () => aiService.generateTests(),
    },
    {
      id: "summarize-project",
      title: "Summarize Project",
      category: "AI Tools",
      icon: FiBox,
      action: () => aiService.summarizeWorkspace(),
    },
    {
      id: "global-search",
      title: "Global Search & Replace",
      category: "Navigation",
      icon: FiSearch,
      action: () => setActiveSidebarTab("search"),
    },
    {
      id: "outline-view",
      title: "Show Outline Explorer",
      category: "Navigation",
      icon: FiLayers,
      action: () => setActiveSidebarTab("outline"),
    },
    {
      id: "toggle-theme",
      title: `Toggle Theme (Current: ${theme})`,
      category: "Preferences",
      icon: FiMoon,
      action: () => {
        const themesList = Object.values(THEMES);
        const currentIndex = themesList.indexOf(theme);
        const nextTheme = themesList[(currentIndex + 1) % themesList.length];
        setTheme(nextTheme);
      },
    },
    {
      id: "toggle-sidebar",
      title: "Toggle Sidebar",
      category: "View",
      icon: FiSidebar,
      action: () => toggleSidebarCollapsed(),
    },
    ...files.map((file) => ({
      id: `open-file-${file.id}`,
      title: `Open File: ${file.name}`,
      category: "Files",
      icon: FiFileText,
      action: () => setActiveFile(file.id),
    })),
  ];

  const filteredCommands = COMMANDS.filter((cmd) =>
    `${cmd.category} ${cmd.title}`.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isCommandPaletteOpen) {
      const timer = setTimeout(() => {
        setQuery("");
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isCommandPaletteOpen]);

  const executeCommand = (cmd) => {
    closeCommandPalette();
    cmd.action();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      closeCommandPalette();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? filteredCommands.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs">
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0"
          onClick={closeCommandPalette}
        />

        {/* Command Palette Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden font-sans z-10"
        >
          {/* Input Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800 bg-neutral-950/80">
            <FiSearch className="text-purple-400 text-base shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search files (Ctrl+Shift+P)..."
              className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
            />
            <span className="text-[10px] text-neutral-500 font-mono border border-neutral-800 px-1.5 py-0.5 rounded">
              ESC to close
            </span>
          </div>

          {/* Commands List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filteredCommands.length === 0 ? (
              <div className="p-4 text-center text-neutral-500 text-xs italic">
                No matching commands found.
              </div>
            ) : (
              filteredCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer ${
                      isSelected
                        ? "bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/20"
                        : "text-neutral-300 hover:bg-neutral-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`text-sm shrink-0 ${
                          isSelected ? "text-white" : "text-purple-400"
                        }`}
                      />
                      <span className="truncate">{cmd.title}</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        isSelected
                          ? "bg-purple-700 text-purple-100"
                          : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {cmd.category}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
