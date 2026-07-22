import { useRef } from "react";
import useEditorStore from "../../store/editorStore";
import useWorkspaceStore from "../../store/workspaceStore";

const Navbar = () => {
  const { language, setLanguage, runCode, isLoading } = useEditorStore();
  const { saveProject, importProject } = useWorkspaceStore();
  const fileInputRef = useRef(null);

  const handleOpenClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importProject(file);
      e.target.value = "";
    }
  };

  return (
    <header className="h-14 bg-[#1e1e1e] border-b border-gray-700 flex items-center justify-between px-5">
      {/* Logo */}
      <h1 className="text-xl font-bold text-purple-400">Pix</h1>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Hidden File Input for Open Project */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pixel,.json"
          className="hidden"
        />

        {/* Open Project Button */}
        <button
          onClick={handleOpenClick}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Open .pixel project file"
        >
          <span>📂</span>
          <span>Open</span>
        </button>

        {/* Save Project Button */}
        <button
          onClick={saveProject}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Save project as .pixel file"
        >
          <span>💾</span>
          <span>Save</span>
        </button>

        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-[#2d2d2d] text-white px-3 py-1.5 rounded-md outline-none border border-gray-600 text-sm cursor-pointer hover:border-purple-500 transition-colors"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="java">Java</option>
        </select>

        {/* Run Code Button */}
        <button
          onClick={runCode}
          disabled={isLoading}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2 ${
            isLoading
              ? "bg-purple-800 text-purple-200 cursor-not-allowed opacity-75"
              : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20"
          }`}
        >
          {isLoading ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Running...
            </>
          ) : (
            "▶ Run"
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;