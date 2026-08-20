import useEditorStore from "../../store/editorStore";
import { FiTrash2 } from "react-icons/fi";

const Console = () => {
  const { output, setOutput, isLoading } = useEditorStore();

  return (
    <div
      style={{
        backgroundColor: "var(--bg-console)",
        borderColor: "var(--border-color)",
      }}
      className="h-44 border-t p-4 font-mono text-sm overflow-auto transition-colors duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span
          style={{ color: "var(--text-muted)" }}
          className="text-xs uppercase tracking-wider font-semibold"
        >
          Console Output
        </span>
        <div className="flex items-center gap-3">
          {isLoading && (
            <span className="text-xs text-purple-400 animate-pulse font-sans flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              Running execution...
            </span>
          )}
          {output && (
            <button
              onClick={() => setOutput("")}
              aria-label="Clear Console Output"
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition cursor-pointer font-sans"
              title="Clear Console"
            >
              <FiTrash2 className="text-xs" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <pre
        style={{ color: "var(--text-main)" }}
        className="whitespace-pre-wrap font-mono text-sm leading-relaxed"
      >
        {output ? output : '// Click "▶ Run" to execute your code.'}
      </pre>
    </div>
  );
};

export default Console;