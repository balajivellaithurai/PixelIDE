import useEditorStore from "../../store/editorStore";
import useWorkspaceStore from "../../store/workspaceStore";
import useThemeStore, { THEMES } from "../../store/themeStore";
import useAIStore from "../../store/aiStore";
import useCollaborationStore from "../../collaboration/collaborationStore";
import ProjectSaveIndicator from "../project/ProjectSaveIndicator";
import CollaborationStatus from "../collaboration/CollaborationStatus";
import { FiFolder, FiSave, FiSliders, FiShare2 } from "react-icons/fi";
import toast from "react-hot-toast";

const Navbar = () => {
  const { language, setLanguage, runCode, isLoading } = useEditorStore();
  const { currentProject, saveCurrentProject, setShowProjectModal } = useWorkspaceStore();
  const { theme, setTheme } = useThemeStore();
  const { openSettingsModal } = useAIStore();
  const { openShareModal } = useCollaborationStore();

  const handleSaveClick = async () => {
    try {
      await saveCurrentProject();
      toast.success("Project saved!");
    } catch (err) {
      toast.error(err.message || "Save failed");
    }
  };

  return (
    <header
      style={{
        backgroundColor: "var(--bg-navbar)",
        borderColor: "var(--border-color)",
      }}
      className="h-14 border-b flex items-center justify-between px-5 transition-colors duration-200 select-none z-10"
    >
      {/* Brand & Project Info */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-purple-400 font-sans tracking-tight">Pix</h1>
        
        <div className="h-4 w-px bg-neutral-800" />

        <button
          onClick={() => setShowProjectModal(true)}
          className="flex items-center gap-2 px-2.5 py-1 bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 hover:border-purple-500/40 rounded-lg text-xs font-mono text-neutral-200 transition cursor-pointer"
          title="Open Project Manager (Manage, New, Recent, Import/Export)"
        >
          <FiFolder className="text-purple-400 text-xs" />
          <span className="font-semibold text-white truncate max-w-[140px]">
            {currentProject?.name || "Pix Project"}
          </span>
        </button>

        {/* Auto Save Status Badge */}
        <ProjectSaveIndicator />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 font-sans">
        {/* Real-time Collaboration Status Badge */}
        <CollaborationStatus />

        {/* Share Project Session Button */}
        <button
          onClick={openShareModal}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          title="Share Project for Real-time Collaboration"
        >
          <FiShare2 className="text-purple-400 text-xs" />
          <span>Share</span>
        </button>

        {/* AI Settings Trigger */}
        <button
          onClick={openSettingsModal}
          style={{
            backgroundColor: "var(--bg-dropdown)",
            color: "var(--text-main)",
            borderColor: "var(--border-color)",
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer hover:opacity-80"
          title="AI Superpowers Settings"
        >
          <FiSliders className="text-purple-400" />
          <span>AI Settings</span>
        </button>
        {/* Projects Manager Modal Trigger */}
        <button
          onClick={() => setShowProjectModal(true)}
          style={{
            backgroundColor: "var(--bg-dropdown)",
            color: "var(--text-main)",
            borderColor: "var(--border-color)",
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer hover:opacity-80"
          title="Open Project Manager"
        >
          <FiFolder className="text-purple-400" />
          <span>Projects</span>
        </button>

        {/* Save Project Button */}
        <button
          onClick={handleSaveClick}
          style={{
            backgroundColor: "var(--bg-dropdown)",
            color: "var(--text-main)",
            borderColor: "var(--border-color)",
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer hover:opacity-80"
          title="Save project (Ctrl+S)"
        >
          <FiSave className="text-purple-400" />
          <span>Save</span>
        </button>

        {/* Theme Selector */}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          style={{
            backgroundColor: "var(--bg-dropdown)",
            color: "var(--text-main)",
            borderColor: "var(--border-color)",
          }}
          className="px-3 py-1.5 rounded-lg outline-none border text-xs cursor-pointer transition-colors font-mono"
          title="Select IDE Theme"
        >
          {THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              🎨 {t.name}
            </option>
          ))}
        </select>

        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            backgroundColor: "var(--bg-dropdown)",
            color: "var(--text-main)",
            borderColor: "var(--border-color)",
          }}
          className="px-3 py-1.5 rounded-lg outline-none border text-xs cursor-pointer transition-colors font-mono"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="java">Java</option>
        </select>

        {/* Run Code Button */}
        <button
          onClick={runCode}
          disabled={isLoading}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2 ${
            isLoading
              ? "bg-purple-800 text-purple-200 cursor-not-allowed opacity-75"
              : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20"
          }`}
          title="Run Code (Ctrl+Enter)"
        >
          {isLoading ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Running...
            </>
          ) : (
            "▶ Run"
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;