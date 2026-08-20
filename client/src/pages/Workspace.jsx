import { useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
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
import AIRefactorDiffModal from "../components/ai/AIRefactorDiffModal";
import CommentPreviewModal from "../components/ai/CommentPreviewModal";
import ReadMePreviewModal from "../components/ai/ReadMePreviewModal";
import SettingsModal from "../components/settings/SettingsModal";
import ShareProjectModal from "../components/collaboration/ShareProjectModal";
import ErrorBoundary from "../components/common/ErrorBoundary";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import useWorkspaceStore from "../store/workspaceStore";
import collaborationService from "../collaboration/collaborationService";

const Workspace = () => {
  // Activate global keyboard shortcut system (Ctrl+S, Ctrl+O, Ctrl+Enter, Ctrl+Shift+P, Ctrl+Shift+F, Ctrl+Shift+E/X/R/T/D/M)
  useKeyboardShortcuts();

  const [searchParams] = useSearchParams();
  const params = useParams();
  const { currentProject } = useWorkspaceStore();

  useEffect(() => {
    // Auto-connect to collaboration room based on URL params or active project ID
    const collabParam = searchParams.get("collab") || params.projectId || currentProject?.id || "default-project";
    collaborationService.connect(collabParam);

    return () => {
      // Keep connection active unless user explicitly leaves workspace
    };
  }, [searchParams, params.projectId, currentProject?.id]);

  return (
    <div
      style={{ backgroundColor: "var(--bg-app)" }}
      className="h-screen flex flex-col transition-colors duration-200 font-sans selection:bg-purple-500/30 overflow-hidden"
    >
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        <ErrorBoundary name="Sidebar">
          <Sidebar />
        </ErrorBoundary>

        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <FileTabs />
          <ErrorBoundary name="Monaco Editor">
            <EditorPanel />
          </ErrorBoundary>
        </div>

        <AIToggleButton />
        <ErrorBoundary name="AI Assistant">
          <AISidebar />
        </ErrorBoundary>
      </div>

      {/* Git Source Control Bottom Status Bar */}
      <GitStatusBar />

      {/* Terminal / Console Panel */}
      <ErrorBoundary name="Console Terminal">
        <Console />
      </ErrorBoundary>

      {/* VS Code Command Palette Overlay (Ctrl+Shift+P) */}
      <CommandPalette />

      {/* Project Manager Modal */}
      <ProjectManagerModal />

      {/* Unsaved Changes Confirmation Modal */}
      <UnsavedChangesModal />

      {/* Sprint 14 & 16 Settings & AI Modals */}
      <AIRefactorDiffModal />
      <CommentPreviewModal />
      <ReadMePreviewModal />
      <SettingsModal />

      {/* Sprint 15 Collaboration Modals */}
      <ShareProjectModal />
    </div>
  );
};

export default Workspace;