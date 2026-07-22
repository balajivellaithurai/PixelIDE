import Navbar from "../components/layout/Navbar";
import FileTabs from "../components/layout/FileTabs";
import Sidebar from "../components/layout/Sidebar";
import EditorPanel from "../components/layout/EditorPanel";
import Console from "../components/layout/Console";

const Workspace = () => {
  return (
    <div
      style={{ backgroundColor: "var(--bg-app)" }}
      className="h-screen flex flex-col transition-colors duration-200"
    >
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <FileTabs />
          <EditorPanel />
        </div>
      </div>

      <Console />
    </div>
  );
};

export default Workspace;