import FileExplorer from "./FileExplorer";

export default function Sidebar() {
  return (
    <aside
      style={{
        backgroundColor: "var(--bg-sidebar)",
        borderColor: "var(--border-color)",
      }}
      className="w-64 border-r flex flex-col p-4 transition-colors duration-200"
    >
      <FileExplorer />
    </aside>
  );
}