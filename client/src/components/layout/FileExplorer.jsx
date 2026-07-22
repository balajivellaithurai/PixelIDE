import { useState } from "react";
import useWorkspaceStore from "../../store/workspaceStore";

export default function FileExplorer() {
  const { files, activeFileId, setActiveFile, addFile, deleteFile } =
    useWorkspaceStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const handleCreateFile = (e) => {
    e.preventDefault();
    if (newFileName.trim()) {
      addFile(newFileName.trim());
      setNewFileName("");
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsCreating(false);
      setNewFileName("");
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with Explorer title and + New File button */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-gray-300 text-xs font-bold uppercase tracking-wider">
          Explorer
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700/60 rounded transition flex items-center justify-center"
          title="New File"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* New File Inline Input */}
      {isCreating && (
        <form onSubmit={handleCreateFile} className="mb-2 px-1">
          <input
            type="text"
            autoFocus
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newFileName.trim()) setIsCreating(false);
            }}
            placeholder="filename.js..."
            className="w-full bg-[#2a2a2a] text-white text-xs px-2 py-1 rounded border border-blue-500 focus:outline-none"
          />
        </form>
      )}

      {/* File List */}
      <div className="space-y-1 overflow-y-auto flex-1">
        {files.map((file) => {
          const isActive = activeFileId === file.id;
          return (
            <div
              key={file.id}
              onClick={() => setActiveFile(file.id)}
              className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-sm transition ${
                isActive
                  ? "bg-blue-600/30 text-blue-400 font-medium border-l-2 border-blue-500"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="text-xs">📄</span>
                <span className="truncate">{file.name}</span>
              </div>

              {files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 rounded transition"
                  title="Delete File"
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}