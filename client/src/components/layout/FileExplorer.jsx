import useWorkspaceStore from "../../store/workspaceStore";

export default function FileExplorer() {
    const { files, activeFileId, setActiveFile } = useWorkspaceStore();

    return (
        <div className="w-60 bg-[#1e1e1e] border-r border-gray-700 h-full p-3">
            <h2 className="text-white text-lg font-semibold mb-4">
                Explorer
            </h2>

            <div className="space-y-1">
                {files.map((file) => (import {useState} from "react";
                import useWorkspaceStore from "../../store/workspaceStore";

                export default function FileExplorer() {
  const {
                    files,
                    activeFileId,
                    setActiveFile,
                    createFile,
  } = useWorkspaceStore();

                const [fileName, setFileName] = useState("");

  const handleCreate = () => {
    if (!fileName.trim()) return;

                const extension = fileName.split(".").pop();

                const languageMap = {
                    js: "javascript",
                py: "python",
                java: "java",
                cpp: "cpp",
                c: "c",
                html: "html",
                css: "css",
    };

                createFile(
                fileName,
                languageMap[extension] || "plaintext"
                );

                setFileName("");
  };

                return (
                <div className="h-full p-3 text-white">

                    <h2 className="text-lg font-bold mb-4">
                        Explorer
                    </h2>

                    <div className="flex gap-2 mb-4">
                        <input
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="main.py"
                            className="flex-1 rounded bg-gray-800 px-2 py-1 outline-none"
                        />

                        <button
                            onClick={handleCreate}
                            className="bg-blue-600 px-3 rounded hover:bg-blue-700"
                        >
                            +
                        </button>
                    </div>

                    <div className="space-y-1">
                        {files.map((file) => (
                            <button
                                key={file.id}
                                onClick={() => setActiveFile(file.id)}
                                className={`w-full text-left px-2 py-2 rounded ${activeFileId === file.id
                                    ? "bg-blue-600"
                                    : "hover:bg-gray-700"
                                    }`}
                            >
                                📄 {file.name}
                            </button>
                        ))}
                    </div>
                </div>
                );
}
                <button
                    key={file.id}
                    onClick={() => setActiveFile(file.id)}
                    className={`w-full text-left px-3 py-2 rounded transition ${activeFileId === file.id
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                        }`}
                >
                    📄 {file.name}
                </button>
                ))}
            </div>
        </div>
    );
}