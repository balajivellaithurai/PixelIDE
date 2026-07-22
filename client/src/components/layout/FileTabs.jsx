import useWorkspaceStore from "../../store/workspaceStore";

export default function FileTabs() {
  const { files, openFiles, activeFileId, setActiveFile, closeFile } =
    useWorkspaceStore();

  const opened = files.filter((file) => openFiles.includes(file.id));

  if (opened.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: "var(--bg-tabs)",
        borderColor: "var(--border-color)",
      }}
      className="flex border-b overflow-x-auto text-sm transition-colors duration-200"
    >
      {opened.map((file) => {
        const isActive = activeFileId === file.id;
        return (
          <div
            key={file.id}
            onClick={() => setActiveFile(file.id)}
            style={
              isActive
                ? {
                    backgroundColor: "var(--bg-tab-active)",
                    color: "var(--text-active)",
                    borderTop: "2px solid var(--accent-color)",
                    borderColor: "var(--border-color)",
                  }
                : {
                    color: "var(--text-muted)",
                    borderColor: "var(--border-color)",
                  }
            }
            className={`group flex items-center space-x-2 px-4 py-2 border-r cursor-pointer select-none transition-colors ${
              !isActive ? "hover:bg-[var(--bg-hover)]" : ""
            }`}
          >
            <span>📄</span>
            <span>{file.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFile(file.id);
              }}
              className="p-0.5 rounded text-gray-500 hover:text-red-400 transition"
              title="Close tab"
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