import Navbar from "../components/layout/Navbar";
import FileTabs from "../components/layout/FileTabs";
import Sidebar from "../components/layout/Sidebar";
import EditorPanel from "../components/layout/EditorPanel";
import Console from "../components/layout/Console";
import AISidebar from "../components/ai/AISidebar";
import AIToggleButton from "../components/ai/AIToggleButton";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";

const Workspace = () => {
  // Activate global keyboard shortcut system
  useKeyboardShortcuts();

  return (
    <div
      style={{ backgroundColor: "var(--bg-app)" }}
      className="h-screen flex flex-col transition-colors duration-200"
    >
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <FileTabs />
          <EditorPanel />
        </div>

        <AIToggleButton />
        <AISidebar />
      </div>

      <Console />
    </div>
  );
};

export default Workspace;