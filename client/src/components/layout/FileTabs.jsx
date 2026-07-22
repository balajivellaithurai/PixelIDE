import useWorkspaceStore from "../../store/workspaceStore";

export default function FileTabs() {
    const {
        files,
        openFiles,
        activeFileId,
        setActiveFile,
        closeFile,
    } = useWorkspaceStore();

    const opened = files.filter((file) =>
        openFiles.includes(file.id)
    );
    console.log(openFiles);
    console.log(files);

    return (
        <div className="h-12 flex bg-red-500 border-b border-gray-700 overflow-x-auto">
            {opened.map((file) => (
                <div
                    key={file.id}
                    className={`flex items-center gap-2 px-4 py-2 cursor-pointer whitespace-nowrap ${activeFileId === file.id
                        ? "bg-[#1e1e1e] text-white"
                        : "text-gray-400 hover:bg-[#333]"
                        }`}
                    onClick={() => setActiveFile(file.id)}
                >
                    <span>{file.name}</span>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            closeFile(file.id);
                        }}
                        className="text-gray-500 hover:text-red-400"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}