import useEditorStore from "../../store/editorStore";

const Console = () => {
  const { output, isLoading } = useEditorStore();

  return (
    <div className="h-44 bg-[#111111] border-t border-gray-700 p-4 font-mono text-sm overflow-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
          Console Output
        </span>
        {isLoading && (
          <span className="text-xs text-purple-400 animate-pulse font-sans">Running...</span>
        )}
      </div>

      <pre className="text-emerald-400 whitespace-pre-wrap font-mono text-sm leading-relaxed">
        {output ? output : '// Click "▶ Run" to execute your code.'}
      </pre>
    </div>
  );
};

export default Console;