import { useState, useRef, useEffect } from "react";
import {
  FiZap,
  FiHelpCircle,
  FiCheckSquare,
  FiRefreshCw,
  FiActivity,
  FiCode,
  FiFileText,
  FiBookOpen,
  FiChevronDown,
  FiSliders,
} from "react-icons/fi";
import aiService from "../../services/aiService";
import useAIStore from "../../store/aiStore";
import toast from "react-hot-toast";

export default function AIActionMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { isLoading, openSettingsModal } = useAIStore();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = async (actionFn, title) => {
    setIsOpen(false);
    try {
      toast.loading(`Running AI ${title}...`, { id: "ai-action-running" });
      await actionFn();
      toast.success(`AI ${title} completed!`, { id: "ai-action-running" });
    } catch (err) {
      toast.error(`AI ${title} failed: ` + (err.message || "Error"), { id: "ai-action-running" });
    }
  };

  const actions = [
    {
      id: "explain",
      label: "Explain",
      description: "Explain current function or code selection",
      icon: FiHelpCircle,
      iconColor: "text-blue-400",
      shortcut: "Ctrl+Shift+E",
      fn: () => aiService.explainFunction(),
    },
    {
      id: "fix",
      label: "Fix",
      description: "Diagnose and fix bugs in code",
      icon: FiCheckSquare,
      iconColor: "text-emerald-400",
      shortcut: "Ctrl+Shift+X",
      fn: () => aiService.fixBug(),
    },
    {
      id: "refactor",
      label: "Refactor",
      description: "Refactor with Monaco Diff preview",
      icon: FiRefreshCw,
      iconColor: "text-purple-400",
      shortcut: "Ctrl+Shift+R",
      fn: () => aiService.refactorCodeWithDiff(),
    },
    {
      id: "optimize",
      label: "Optimize",
      description: "Optimize execution speed and memory",
      icon: FiActivity,
      iconColor: "text-amber-400",
      fn: () => aiService.optimizeCode(),
    },
    {
      id: "tests",
      label: "Generate Tests",
      description: "Generate unit test suite",
      icon: FiCode,
      iconColor: "text-cyan-400",
      shortcut: "Ctrl+Shift+T",
      fn: () => aiService.generateTests(),
    },
    {
      id: "docs",
      label: "Add Documentation",
      description: "Generate JSDoc/docstring comments with preview",
      icon: FiFileText,
      iconColor: "text-yellow-400",
      shortcut: "Ctrl+Shift+D",
      fn: () => aiService.generateComments(),
    },
    {
      id: "readme",
      label: "Generate README",
      description: "Analyze project and generate README.md",
      icon: FiBookOpen,
      iconColor: "text-pink-400",
      shortcut: "Ctrl+Shift+M",
      fn: () => aiService.generateReadme(),
    },
  ];

  return (
    <div className="relative font-sans" ref={menuRef}>
      {/* Menu Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
          isLoading
            ? "bg-purple-900/40 border-purple-500/30 text-purple-300 opacity-80 cursor-wait"
            : "bg-neutral-900/80 hover:bg-neutral-800 border-neutral-700/80 text-purple-300 hover:border-purple-500/50"
        }`}
        title="AI Code Actions Menu"
      >
        <FiZap className="text-purple-400 text-xs animate-pulse" />
        <span>AI Actions</span>
        <FiChevronDown className={`text-xs transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Action Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="font-semibold text-neutral-300 uppercase tracking-wider">
              ✨ AI Superpowers
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                openSettingsModal();
              }}
              className="text-neutral-400 hover:text-purple-300 transition p-0.5 rounded hover:bg-neutral-800"
              title="AI Settings"
            >
              <FiSliders className="text-xs" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto py-1">
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={() => handleAction(act.fn, act.label)}
                  className="w-full px-3 py-2 flex items-start gap-2.5 hover:bg-neutral-800/80 transition text-left group cursor-pointer"
                >
                  <Icon className={`text-sm mt-0.5 ${act.iconColor} group-hover:scale-110 transition-transform`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-200 group-hover:text-purple-300 transition">
                        {act.label}
                      </span>
                      {act.shortcut && (
                        <span className="text-[10px] font-mono text-neutral-500 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                          {act.shortcut}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {act.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
