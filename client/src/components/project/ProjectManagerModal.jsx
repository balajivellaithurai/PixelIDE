import { useState, useRef } from "react";
import {
  FiFolder,
  FiPlus,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiClock,
  FiX,
  FiCheck,
  FiFileText,
  FiCode,
  FiGlobe,
} from "react-icons/fi";
import useWorkspaceStore from "../../store/workspaceStore";
import { PROJECT_TEMPLATES } from "../../services/projectService";
import toast from "react-hot-toast";

export default function ProjectManagerModal() {
  const {
    currentProject,
    recentProjects,
    showProjectModal,
    setShowProjectModal,
    hasUnsavedChanges,
    setShowUnsavedModal,
    setPendingAction,
    createNewProject,
    openRecentProject,
    removeRecentProject,
    exportAsZip,
    exportAsJson,
    importFromZip,
    importFromJson,
  } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState("recent"); // 'recent' | 'new' | 'port'
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const fileZipRef = useRef(null);
  const fileJsonRef = useRef(null);

  if (!showProjectModal) return null;

  const runWithUnsavedCheck = (action) => {
    if (hasUnsavedChanges) {
      setPendingAction(() => action);
      setShowUnsavedModal(true);
    } else {
      action();
    }
  };

  const handleCreateNew = () => {
    runWithUnsavedCheck(async () => {
      try {
        await createNewProject(newProjectName.trim(), selectedTemplate);
        toast.success(`Created project "${newProjectName.trim() || "New Project"}"`);
        setNewProjectName("");
        setShowProjectModal(false);
      } catch (err) {
        toast.error(err.message || "Failed to create project");
      }
    });
  };

  const handleOpenRecent = (project) => {
    runWithUnsavedCheck(async () => {
      try {
        await openRecentProject(project);
        toast.success(`Opened project "${project.name}"`);
        setShowProjectModal(false);
      } catch (err) {
        toast.error(err.message || "Failed to open project");
      }
    });
  };

  const handleRemoveRecent = (e, projectId) => {
    e.stopPropagation();
    removeRecentProject(projectId);
    toast.success("Removed from recent projects list");
  };

  const handleZipFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    runWithUnsavedCheck(async () => {
      try {
        await importFromZip(file);
        toast.success(`Imported project from ${file.name}`);
        setShowProjectModal(false);
      } catch (err) {
        toast.error(err.message || "ZIP import failed");
      } finally {
        e.target.value = "";
      }
    });
  };

  const handleJsonFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    runWithUnsavedCheck(async () => {
      try {
        await importFromJson(file);
        toast.success(`Imported project from ${file.name}`);
        setShowProjectModal(false);
      } catch (err) {
        toast.error(err.message || "Project import failed");
      } finally {
        e.target.value = "";
      }
    });
  };

  const handleExportZip = async () => {
    try {
      await exportAsZip();
      toast.success("Exported project ZIP archive!");
    } catch (err) {
      toast.error(err.message || "Failed to export ZIP");
    }
  };

  const handleExportJson = () => {
    try {
      exportAsJson();
      toast.success("Exported .pixproject file!");
    } catch (err) {
      toast.error(err.message || "Failed to export project file");
    }
  };

  const getTemplateIcon = (id) => {
    switch (id) {
      case "python":
        return <FiCode className="text-amber-400 text-lg" />;
      case "web":
        return <FiGlobe className="text-cyan-400 text-lg" />;
      case "javascript":
        return <FiCode className="text-yellow-400 text-lg" />;
      default:
        return <FiFileText className="text-purple-400 text-lg" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-40 flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full h-[520px] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl">
              <FiFolder className="text-lg" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Project Manager</h2>
              <p className="text-[11px] text-neutral-400 font-mono">
                Active: <span className="text-purple-300 font-semibold">{currentProject?.name || "Pix Workspace"}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowProjectModal(false)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-neutral-800 bg-neutral-950/40 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab("recent")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 border-t border-x ${
              activeTab === "recent"
                ? "bg-neutral-900 text-purple-300 border-neutral-800"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <FiClock className="text-xs" />
            <span>Recent Projects ({recentProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("new")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 border-t border-x ${
              activeTab === "new"
                ? "bg-neutral-900 text-purple-300 border-neutral-800"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <FiPlus className="text-xs" />
            <span>New Project</span>
          </button>

          <button
            onClick={() => setActiveTab("port")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition cursor-pointer flex items-center gap-1.5 border-t border-x ${
              activeTab === "port"
                ? "bg-neutral-900 text-purple-300 border-neutral-800"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <FiDownload className="text-xs" />
            <span>Import / Export</span>
          </button>
        </div>

        {/* Main Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-neutral-900">
          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={fileZipRef}
            onChange={handleZipFileSelected}
            accept=".zip"
            className="hidden"
          />
          <input
            type="file"
            ref={fileJsonRef}
            onChange={handleJsonFileSelected}
            accept=".pixproject,.pixel,.json"
            className="hidden"
          />

          {/* TAB 1: Recent Projects */}
          {activeTab === "recent" && (
            <div className="space-y-3">
              {recentProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-500">
                  <FiClock className="text-3xl mb-2 text-neutral-600" />
                  <p className="text-xs font-medium">No recent projects stored.</p>
                  <p className="text-[11px] text-neutral-600 mt-1">
                    Create a new project or import a ZIP to get started!
                  </p>
                </div>
              ) : (
                recentProjects.map((p) => {
                  const isActive = p.id === currentProject?.id;
                  const timeStr = p.lastOpened
                    ? new Date(p.lastOpened).toLocaleDateString() +
                      " " +
                      new Date(p.lastOpened).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recently";

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleOpenRecent(p)}
                      className={`group flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                        isActive
                          ? "bg-purple-600/10 border-purple-500/30 text-purple-300"
                          : "bg-neutral-950/60 border-neutral-800 hover:border-purple-500/40 text-neutral-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-purple-400">
                          <FiFolder className="text-base" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              {p.name}
                            </span>
                            {isActive && (
                              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-mono">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-neutral-500 mt-0.5 font-mono">
                            <span>{p.fileCount || 0} Files</span>
                            <span>•</span>
                            <span>{timeStr}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleRemoveRecent(e, p.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition"
                        title="Remove from recent projects list"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: New Project */}
          {activeTab === "new" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. My Awesome App"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-2">
                  Select Starter Template
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(PROJECT_TEMPLATES).map((tmpl) => {
                    const isSelected = selectedTemplate === tmpl.id;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => setSelectedTemplate(tmpl.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                          isSelected
                            ? "bg-purple-600/15 border-purple-500 text-purple-300"
                            : "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300"
                        }`}
                      >
                        <div className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg shrink-0">
                          {getTemplateIcon(tmpl.id)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">
                              {tmpl.name}
                            </span>
                            {isSelected && (
                              <FiCheck className="text-purple-400 text-xs shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-1 truncate">
                            {tmpl.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCreateNew}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <FiPlus className="text-sm" />
                  <span>Create Project</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Import / Export */}
          {activeTab === "port" && (
            <div className="grid grid-cols-2 gap-4">
              {/* Export Box */}
              <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                  <FiUpload className="text-sm" />
                  <span>Export Project</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Export your full project containing workspace files, directory tree, and tabs into a compressed ZIP or JSON archive.
                </p>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleExportZip}
                    className="w-full py-2 px-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FiDownload />
                    <span>Export as ZIP (.zip)</span>
                  </button>

                  <button
                    onClick={handleExportJson}
                    className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FiDownload />
                    <span>Export Metadata (.pixproject)</span>
                  </button>
                </div>
              </div>

              {/* Import Box */}
              <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <FiDownload className="text-sm" />
                  <span>Import Project</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Import a project from a ZIP file or `.pixproject` file. Includes automatic path traversal security validation.
                </p>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => fileZipRef.current?.click()}
                    className="w-full py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FiUpload />
                    <span>Import ZIP File (.zip)</span>
                  </button>

                  <button
                    onClick={() => fileJsonRef.current?.click()}
                    className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FiUpload />
                    <span>Import Metadata (.pixproject)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
