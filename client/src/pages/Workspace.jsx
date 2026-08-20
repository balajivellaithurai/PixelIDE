import Navbar from "../components/layout/Navbar";
import FileTabs from "../components/layout/FileTabs";
import Sidebar from "../components/layout/Sidebar";
import EditorPanel from "../components/layout/EditorPanel";
import Console from "../components/layout/Console";
import AISidebar from "../components/ai/AISidebar";
import AIToggleButton from "../components/ai/AIToggleButton";
import CommandPalette from "../components/ide/CommandPalette";
import GitStatusBar from "../components/git/GitStatusBar";
import ProjectManagerModal from "../components/project/ProjectManagerModal";
import UnsavedChangesModal from "../components/project/UnsavedChangesModal";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";

const Workspace = () => {
  // Activate global keyboard shortcut system (Ctrl+S, Ctrl+O, Ctrl+Enter, Ctrl+Shift+P, Ctrl+Shift+F)
  useKeyboardShortcuts();

  return (
    <div
      style={{ backgroundColor: "var(--bg-app)" }}
      className="h-screen flex flex-col transition-colors duration-200 font-sans selection:bg-purple-500/30 overflow-hidden"
    >
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <FileTabs />
          <EditorPanel />
        </div>

        <AIToggleButton />
        <AISidebar />
      </div>

      {/* Git Source Control Bottom Status Bar */}
      <GitStatusBar />

      {/* Terminal / Console Panel */}
      <Console />

      {/* VS Code Command Palette Overlay (Ctrl+Shift+P) */}
      <CommandPalette />

      {/* Project Manager Modal */}
      <ProjectManagerModal />

      {/* Unsaved Changes Confirmation Modal */}
      <UnsavedChangesModal />
    </div>
  );
};

export default Workspace;