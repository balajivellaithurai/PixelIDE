import useWorkspaceStore from "../../store/workspaceStore";

export default function FileTabs() {
  const { files, openFileIds, activeFileId, setActiveFile, closeTab } =
    useWorkspaceStore();

  const openFiles = files.filter((f) => openFileIds.includes(f.id));

  if (openFiles.length === 0) return null;

  return (
    <div className="flex bg-[#1e1e1e] border-b border-gray-800 overflow-x-auto text-sm">
      {openFiles.map((file) => {
        const isActive = activeFileId === file.id;
        return (
          <div
            key={file.id}
            onClick={() => setActiveFile(file.id)}
            className={`group flex items-center space-x-2 px-3 py-2 border-r border-gray-800 cursor-pointer select-none transition ${
              isActive
                ? "bg-[#111827] text-blue-400 border-t-2 border-t-blue-500 font-medium"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            }`}
          >
            <span>📄</span>
            <span>{file.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(file.id);
              }}
              className="p-0.5 rounded text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
