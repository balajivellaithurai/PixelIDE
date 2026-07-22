import { useRef } from "react";
import useEditorStore from "../../store/editorStore";
import useWorkspaceStore from "../../store/workspaceStore";
import useThemeStore, { THEMES } from "../../store/themeStore";

const Navbar = () => {
  const { language, setLanguage, runCode, isLoading } = useEditorStore();
  const { saveProject, importProject } = useWorkspaceStore();
  const { theme, setTheme } = useThemeStore();
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
    <header
      style={{
        backgroundColor: "var(--bg-navbar)",
        borderColor: "var(--border-color)",
      }}
      className="h-14 border-b flex items-center justify-between px-5 transition-colors duration-200"
    >
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
          style={{
            backgroundColor: "var(--bg-dropdown)",
            color: "var(--text-main)",
            borderColor: "var(--border-color)",
          }}
          className="px-3 py-1.5 rounded-md text-sm font-medium border transition-colors flex items-center gap-1.5 cursor-pointer hover:opacity-80"
          title="Open .pixel project file"
        >
          <span>📂</span>
          <span>Open</span>
        </button>

        {/* Save Project Button */}
        <button
          onClick={saveProject}
          style={{
            backgroundColor: "var(--bg-dropdown)",
            color: "var(--text-main)",
            borderColor: "var(--border-color)",
          }}
          className="px-3 py-1.5 rounded-md text-sm font-medium border transition-colors flex items-center gap-1.5 cursor-pointer hover:opacity-80"
          title="Save project as .pixel file"
        >
          <span>💾</span>
          <span>Save</span>
        </button>

        {/* Theme Selector */}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          style={{
            backgroundColor: "var(--bg-dropdown)",
            color: "var(--text-main)",
            borderColor: "var(--border-color)",
          }}
          className="px-3 py-1.5 rounded-md outline-none border text-sm cursor-pointer transition-colors"
          title="Select IDE Theme"
        >
          {THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              🎨 {t.name}
            </option>
          ))}
        </select>

        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            backgroundColor: "var(--bg-dropdown)",
            color: "var(--text-main)",
            borderColor: "var(--border-color)",
          }}
          className="px-3 py-1.5 rounded-md outline-none border text-sm cursor-pointer transition-colors"
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