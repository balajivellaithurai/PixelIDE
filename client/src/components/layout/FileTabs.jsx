import useWorkspaceStore from "../../store/workspaceStore";
import useIDEStore from "../../store/ideStore";
import FileIcon from "../ide/FileIcon";

export default function FileTabs() {
  const { files, openFiles, activeFileId, setActiveFile, closeFile } =
    useWorkspaceStore();
  const { unsavedFileIds } = useIDEStore();

  const opened = files.filter((file) => openFiles.includes(file.id));

  return (
    <div
      style={{
        backgroundColor: "var(--bg-sidebar)",
        borderColor: "var(--border-color)",
      }}
      className="h-10 flex border-b overflow-x-auto select-none shrink-0 transition-colors duration-200"
    >
      {opened.map((file) => {
        const isActive = activeFileId === file.id;
        const isUnsaved = unsavedFileIds.includes(file.id);

        return (
          <div
            key={file.id}
            onClick={() => setActiveFile(file.id)}
            style={
              isActive
                ? {
                    backgroundColor: "var(--bg-editor)",
                    color: "var(--text-active)",
                    borderBottom: "2px solid var(--accent-color)",
                  }
                : {
                    color: "var(--text-muted)",
                  }
            }
            className={`group flex items-center gap-2 px-3.5 py-1.5 cursor-pointer text-xs transition-colors border-r border-neutral-800/80 ${
              !isActive ? "hover:bg-[var(--bg-hover)] hover:text-white" : ""
            }`}
          >
            <FileIcon filename={file.name} className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px] font-medium">{file.name}</span>

            {isUnsaved && (
              <span
                className="w-2 h-2 rounded-full bg-purple-400 shrink-0"
                title="Unsaved changes"
              ></span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFile(file.id);
              }}
              className="text-neutral-500 hover:text-white hover:bg-neutral-800 p-0.5 rounded transition cursor-pointer text-xs font-bold"
              title="Close tab"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}