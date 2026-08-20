import { useState } from "react";
import { FiSettings, FiX, FiCheck, FiSliders, FiCpu } from "react-icons/fi";
import useAIStore from "../../store/aiStore";
import toast from "react-hot-toast";

export default function AISettingsModal() {
  const { showSettingsModal, closeSettingsModal, aiSettings, setAISettings } = useAIStore();

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

  if (!showSettingsModal) return null;

  const handleSave = () => {
    setAISettings({
      aiCompletionEnabled,
      inlineSuggestionsEnabled,
      completionDelay: Number(completionDelay),
      aiModel,
    });
    toast.success("AI Settings saved successfully!", { id: "ai-settings-saved" });
    closeSettingsModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-6 font-sans">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <FiSettings className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">
                AI Superpower Settings
              </h2>
              <p className="text-xs text-neutral-400">
                Configure inline code completions, response delays, and AI models.
              </p>
            </div>
          </div>

          <button
            onClick={closeSettingsModal}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Settings Form Body */}
        <div className="p-6 space-y-6 text-xs text-neutral-300 font-sans">
          {/* Toggle: AI Completion */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div>
              <div className="font-semibold text-white">AI Code Completion</div>
              <div className="text-neutral-400 text-[11px]">
                Enable AI suggestions and completions across all files.
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

          {/* Toggle: Inline Suggestions */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div>
              <div className="font-semibold text-white">Monaco Ghost Suggestions</div>
              <div className="text-neutral-400 text-[11px]">
                Render ghost text completion directly inside editor as you type.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={inlineSuggestionsEnabled}
                onChange={(e) => setInlineSuggestionsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Slider: Completion Delay */}
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <FiSliders className="text-purple-400" />
                Completion Debounce Delay
              </div>
              <span className="font-mono text-purple-300 font-bold">
                {completionDelay} ms
              </span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              Wait time after typing before sending inline completion requests.
            </p>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={completionDelay}
              onChange={(e) => setCompletionDelay(e.target.value)}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Dropdown: AI Model */}
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <FiCpu className="text-purple-400" />
              Gemini AI Model
            </div>
            <p className="text-neutral-400 text-[11px]">
              Select the active Gemini LLM model engine for completions and actions.
            </p>
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-mono text-neutral-200 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="gemini-3.6-flash">gemini-3.6-flash (Recommended / Fast)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Reasoning)</option>
              <option value="gemini-1.5-flash">gemini-1.5-flash (Standard)</option>
            </select>
          </div>
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
            Save AI Settings
          </button>
        </div>
      </div>
    </div>
  );
}
