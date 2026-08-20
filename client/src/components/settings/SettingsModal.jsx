import { useState, useEffect } from "react";
import {
  FiSettings,
  FiX,
  FiCheck,
  FiCode,
  FiSun,
  FiZap,
  FiUsers,
  FiSliders,
  FiCpu,
} from "react-icons/fi";
import useEditorStore from "../../store/editorStore";
import useThemeStore, { THEMES } from "../../store/themeStore";
import useAIStore from "../../store/aiStore";
import useCollaborationStore from "../../collaboration/collaborationStore";
import collaborationService from "../../collaboration/collaborationService";
import toast from "react-hot-toast";

export default function SettingsModal() {
  const { showSettingsModal, closeSettingsModal, aiSettings, setAISettings } = useAIStore();
  const { editorOptions, setEditorOptions } = useEditorStore();
  const { theme, setTheme } = useThemeStore();
  const { identity, setIdentity } = useCollaborationStore();

  const [activeTab, setActiveTab] = useState("editor"); // "editor" | "appearance" | "ai" | "collab"

  // Editor Settings
  const [fontSize, setFontSize] = useState(editorOptions?.fontSize || 14);
  const [tabSize, setTabSize] = useState(editorOptions?.tabSize || 2);
  const [wordWrap, setWordWrap] = useState(editorOptions?.wordWrap || "off");
  const [minimap, setMinimap] = useState(editorOptions?.minimap || false);

  // AI Settings
  const [aiCompletionEnabled, setAiCompletionEnabled] = useState(
    aiSettings?.aiCompletionEnabled !== false
  );
  const [inlineSuggestionsEnabled, setInlineSuggestionsEnabled] = useState(
    aiSettings?.inlineSuggestionsEnabled !== false
  );
  const [completionDelay, setCompletionDelay] = useState(
    aiSettings?.completionDelay || 300
  );
  const [aiModel, setAiModel] = useState(
    aiSettings?.aiModel || "gemini-3.6-flash"
  );

  // Collab Identity
  const [userName, setUserName] = useState(identity?.name || "");

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showSettingsModal) {
        closeSettingsModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSettingsModal, closeSettingsModal]);

  if (!showSettingsModal) return null;

  const handleSave = () => {
    // 1. Update Editor Options
    setEditorOptions({
      fontSize: Number(fontSize),
      tabSize: Number(tabSize),
      wordWrap,
      minimap: Boolean(minimap),
    });

    // 2. Update AI Settings
    setAISettings({
      aiCompletionEnabled,
      inlineSuggestionsEnabled,
      completionDelay: Number(completionDelay),
      aiModel,
    });

    // 3. Update Collaboration Identity
    if (userName && userName.trim() !== identity?.name) {
      const updatedIdentity = { ...identity, name: userName.trim() };
      setIdentity(updatedIdentity);
      collaborationService.notifyUsernameChanged(userName.trim());
    }

    toast.success("IDE Settings saved successfully!", { id: "settings-saved" });
    closeSettingsModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-6 font-sans">
      <div className="w-full max-w-2xl h-[85vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <FiSettings className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">
                PixelIDE Settings
              </h2>
              <p className="text-xs text-neutral-400">
                Configure editor options, themes, AI superpowers, and collaboration identity.
              </p>
            </div>
          </div>

          <button
            onClick={closeSettingsModal}
            aria-label="Close Settings Modal"
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-neutral-800 bg-neutral-900/60 text-xs font-mono">
          <button
            onClick={() => setActiveTab("editor")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === "editor"
                ? "bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <FiCode /> Editor
          </button>
          <button
            onClick={() => setActiveTab("appearance")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === "appearance"
                ? "bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <FiSun /> Appearance
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === "ai"
                ? "bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <FiZap /> AI Superpowers
          </button>
          <button
            onClick={() => setActiveTab("collab")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === "collab"
                ? "bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <FiUsers /> Collaboration
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 min-h-0 p-6 overflow-y-auto space-y-5 text-xs text-neutral-300 font-sans bg-neutral-950/40">
          {/* TAB 1: EDITOR */}
          {activeTab === "editor" && (
            <div className="space-y-4">
              {/* Font Size */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Font Size (px)</div>
                  <div className="text-neutral-400 text-[11px]">
                    Editor text size in pixels (10px - 24px)
                  </div>
                </div>
                <input
                  type="number"
                  min="10"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-20 px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-xs font-mono text-white outline-none focus:border-purple-500 text-center"
                />
              </div>

              {/* Tab Size */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Tab Indentation Size</div>
                  <div className="text-neutral-400 text-[11px]">
                    Number of spaces equivalent to one tab
                  </div>
                </div>
                <select
                  value={tabSize}
                  onChange={(e) => setTabSize(e.target.value)}
                  className="px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-xs font-mono text-white outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="2">2 spaces</option>
                  <option value="4">4 spaces</option>
                  <option value="8">8 spaces</option>
                </select>
              </div>

              {/* Word Wrap */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Word Wrap</div>
                  <div className="text-neutral-400 text-[11px]">
                    Wrap long lines exceeding editor viewport
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wordWrap === "on"}
                    onChange={(e) => setWordWrap(e.target.checked ? "on" : "off")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Minimap */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Editor Minimap</div>
                  <div className="text-neutral-400 text-[11px]">
                    Show code minimap scrollbar preview
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={minimap}
                    onChange={(e) => setMinimap(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div>
                  <div className="font-semibold text-white">Editor & IDE Theme</div>
                  <div className="text-neutral-400 text-[11px]">
                    Select theme palette for Monaco Editor and interface accents
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs transition cursor-pointer ${
                        theme === t.id
                          ? "bg-purple-950/30 border-purple-500 text-purple-200 font-semibold"
                          : "bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                      }`}
                    >
                      <span>🎨 {t.name}</span>
                      {theme === t.id && <FiCheck className="text-purple-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI SUPERPOWERS */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <div>
                  <div className="font-semibold text-white">AI Code Completion</div>
                  <div className="text-neutral-400 text-[11px]">
                    Enable AI ghost text suggestions while typing
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiCompletionEnabled}
                    onChange={(e) => setAiCompletionEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <FiSliders className="text-purple-400" />
                    Completion Debounce Delay
                  </div>
                  <span className="font-mono text-purple-300 font-bold">
                    {completionDelay} ms
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={completionDelay}
                  onChange={(e) => setCompletionDelay(e.target.value)}
                  className="w-full h-1.5 bg-neutral-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <FiCpu className="text-purple-400" />
                  Gemini Model Engine
                </div>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs font-mono text-white outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="gemini-3.6-flash">gemini-3.6-flash (Recommended / Fast)</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Reasoning)</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash (Standard)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: COLLABORATION */}
          {activeTab === "collab" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="font-semibold text-white">Collaboration Display Name</div>
                <div className="text-neutral-400 text-[11px]">
                  Name visible to teammates in live collaboration sessions and chat
                </div>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs font-mono text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-800 bg-neutral-950/90 font-sans">
          <button
            onClick={closeSettingsModal}
            className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <FiCheck className="text-sm" />
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
}
