import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import EditorPanel from "../components/layout/EditorPanel";
import Console from "../components/layout/Console";

const Workspace = () => {
    return (
        <div className="h-screen flex flex-col bg-[#111827]">
            <Navbar />

            <div className="flex flex-1">
                <Sidebar />
                <EditorPanel />
            </div>

            <Console />
        </div>
    );
};

export default Workspace;