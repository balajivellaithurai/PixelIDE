import FileExplorer from "./FileExplorer";

export default function Sidebar() {
    return (
        <aside className="w-64 bg-[#1e1e1e] border-r border-gray-800 flex flex-col p-4">
            <FileExplorer />
        </aside>
    );
}