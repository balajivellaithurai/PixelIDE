import { useState } from "react";
import useWorkspaceStore from "../../store/workspaceStore";

export default function FileExplorer() {
  const { files, activeFileId, setActiveFile, createFile, deleteFile } =
    useWorkspaceStore();

  const [fileName, setFileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e) => {
    e?.preventDefault();
    if (!fileName.trim()) return;

    const extension = fileName.split(".").pop()?.toLowerCase();

    const languageMap = {
      js: "javascript",
      jsx: "javascript",
      ts: "javascript",
      tsx: "javascript",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      html: "html",
      css: "css",
      json: "json",
    };

    createFile(fileName, languageMap[extension] || "plaintext");
    setFileName("");
    setIsCreating(false);
  };

  return (
    <div className="h-full flex flex-col text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Explorer
        </h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition"
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

      {/* Inline Create Input */}
      {isCreating && (
        <form onSubmit={handleCreate} className="flex gap-1 mb-3">
          <input
            autoFocus
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="filename.py"
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsCreating(false);
            }}
            className="flex-1 rounded bg-gray-800 px-2 py-1 text-xs outline-none border border-blue-500 text-white"
          />
          <button
            type="submit"
            className="bg-blue-600 px-2.5 py-1 text-xs rounded hover:bg-blue-700 text-white font-medium"
          >
            +
          </button>
        </form>
      )}

      {/* File List */}
      <div className="space-y-1 overflow-y-auto flex-1">
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => setActiveFile(file.id)}
            className={`group flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer text-sm transition ${
              activeFileId === file.id
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
                title="Delete file"
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
        ))}
      </div>
    </div>
  );
}