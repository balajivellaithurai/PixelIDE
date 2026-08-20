import { useRef } from "react";
import { DiffEditor } from "@monaco-editor/react";
import { FiX, FiGitPullRequest } from "react-icons/fi";
import useGitStore from "../../store/gitStore";
import useThemeStore from "../../store/themeStore";
import { applyMonacoTheme } from "../../utils/themeRegistry";
import FileIcon from "../ide/FileIcon";

export default function GitDiffViewer() {
  const { activeDiffFile, closeDiff } = useGitStore();
  const { theme } = useThemeStore();
  const diffEditorRef = useRef(null);

  if (!activeDiffFile) return null;

  const handleMount = (editor, monaco) => {
    diffEditorRef.current = editor;
    applyMonacoTheme(monaco, theme);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 min-h-0 border-l border-neutral-800 z-20">
      {/* Diff Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-900/80 font-sans text-xs">
        <div className="flex items-center gap-2 text-neutral-300">
          <FiGitPullRequest className="text-purple-400 text-sm" />
          <span className="font-semibold text-white">Diff Inspection:</span>
          <FileIcon filename={activeDiffFile.name} className="w-3.5 h-3.5" />
          <span className="font-mono text-purple-300">{activeDiffFile.name}</span>
          <span className="text-[10px] text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">
            Head vs Working Tree
          </span>
        </div>

        <button
          onClick={closeDiff}
          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition cursor-pointer"
          title="Close Diff View"
        >
          <FiX className="text-base" />
        </button>
      </div>

      {/* Monaco Diff Editor */}
      <div className="flex-1 min-h-0 relative">
        <DiffEditor
          height="100%"
          language={activeDiffFile.language || "javascript"}
          original={activeDiffFile.originalContent || ""}
          modified={activeDiffFile.modifiedContent || activeDiffFile.content || ""}
          onMount={handleMount}
          theme={theme}
          options={{
            fontSize: 13,
            renderSideBySide: true,
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
