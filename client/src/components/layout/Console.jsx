import useEditorStore from "../../store/editorStore";

const Console = () => {
  const { output, isLoading } = useEditorStore();

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
        {isLoading && (
          <span className="text-xs text-purple-400 animate-pulse font-sans">
            Running...
          </span>
        )}
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