import { create } from "zustand";
import useEditorStore from "./editorStore";
import gitService from "../services/gitService";
import {
  createProjectMetadata,
  PROJECT_TEMPLATES,
  getLanguageFromFilename,
  getRecentProjects,
  addRecentProject,
  removeRecentProject as removeRecentFromStorage,
  saveActiveProjectToStorage,
  getActiveProjectFromStorage,
  exportProjectZip,
  exportProjectFile,
  importProjectZip,
  parseProjectFile,
} from "../services/projectService";

let autoSaveTimer = null;

const defaultFiles = [
  {
    id: "1",
    name: "app.js",
    language: "javascript",
    content: `// JavaScript\nconsole.log("Hello, World!");`,
  },
  {
    id: "2",
    name: "script.py",
    language: "python",
    content: '# Python\nprint("Hello, World!")',
  },
  {
    id: "3",
    name: "main.cpp",
    language: "cpp",
    content:
      '// C++\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
  },
];

const initialProject =
  getActiveProjectFromStorage() ||
  createProjectMetadata({
    name: "Pix Demo Project",
    files: defaultFiles,
    activeFileId: "1",
    openFiles: ["1", "2", "3"],
  });

const useWorkspaceStore = create((set, get) => ({
  currentProject: initialProject,
  recentProjects: getRecentProjects(),
  files: initialProject.files || defaultFiles,
  activeFileId: initialProject.activeFileId || "1",
  openFiles: initialProject.openFiles || ["1", "2", "3"],
  recentlyEditedFiles: (initialProject.files || defaultFiles).map((f) => f.name),
  saveStatus: "saved", // 'saved' | 'saving' | 'unsaved'
  hasUnsavedChanges: false,
  showProjectModal: false,
  showUnsavedModal: false,
  pendingAction: null, // callback to run after user approves unsaved changes dialog

  setShowProjectModal: (show) => set({ showProjectModal: show }),
  setShowUnsavedModal: (show) => set({ showUnsavedModal: show }),
  setPendingAction: (action) => set({ pendingAction: action }),

  // Schedule debounced auto-save
  scheduleAutoSave: () => {
    set({ hasUnsavedChanges: true, saveStatus: "unsaved" });
    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    autoSaveTimer = setTimeout(async () => {
      set({ saveStatus: "saving" });
      const state = get();
      const updatedProject = {
        ...state.currentProject,
        updatedAt: new Date().toISOString(),
        files: state.files,
        activeFileId: state.activeFileId,
        openFiles: state.openFiles,
      };

      saveActiveProjectToStorage(updatedProject);
      await gitService.syncFiles(state.files);

      set({
        currentProject: updatedProject,
        recentProjects: getRecentProjects(),
        hasUnsavedChanges: false,
        saveStatus: "saved",
      });
    }, 1000);
  },

  setActiveFile: (id) => {
    const file = get().files.find((f) => f.id === id);
    if (file) {
      set((state) => ({
        activeFileId: id,
        openFiles: state.openFiles.includes(id)
          ? state.openFiles
          : [...state.openFiles, id],
        recentlyEditedFiles: [
          file.name,
          ...state.recentlyEditedFiles.filter((n) => n !== file.name),
        ].slice(0, 10),
      }));
      useEditorStore.getState().setLanguage(file.language);
      if (file.content !== undefined) {
        useEditorStore.getState().setCode(file.content);
      }
    }
  },

  updateFileContent: (id, content) => {
    set((state) => {
      const target = state.files.find((f) => f.id === id);
      const recent = target
        ? [target.name, ...state.recentlyEditedFiles.filter((n) => n !== target.name)].slice(0, 10)
        : state.recentlyEditedFiles;

      return {
        files: state.files.map((file) =>
          file.id === id ? { ...file, content } : file
        ),
        recentlyEditedFiles: recent,
      };
    });
    get().scheduleAutoSave();
  },

  createFile: (name, language) => {
    if (!name || !name.trim()) return;
    const inferredLang = language || getLanguageFromFilename(name);
    const newFile = {
      id: crypto.randomUUID(),
      name: name.trim(),
      language: inferredLang,
      content: "",
    };

    set((state) => ({
      files: [...state.files, newFile],
      openFiles: [...state.openFiles, newFile.id],
      activeFileId: newFile.id,
    }));

    useEditorStore.getState().setLanguage(newFile.language);
    useEditorStore.getState().setCode("");
    get().scheduleAutoSave();
  },

  closeFile: (id) => {
    set((state) => {
      const openFiles = state.openFiles.filter((fileId) => fileId !== id);
      let nextActive = state.activeFileId;
      if (state.activeFileId === id) {
        nextActive =
          openFiles.length > 0 ? openFiles[openFiles.length - 1] : null;
      }
      if (nextActive) {
        const file = state.files.find((f) => f.id === nextActive);
        if (file) {
          useEditorStore.getState().setLanguage(file.language);
          if (file.content !== undefined) {
            useEditorStore.getState().setCode(file.content);
          }
        }
      }
      return {
        openFiles,
        activeFileId: nextActive,
      };
    });
    get().scheduleAutoSave();
  },

  deleteFile: (id) => {
    set((state) => {
      const files = state.files.filter((f) => f.id !== id);
      const openFiles = state.openFiles.filter((fileId) => fileId !== id);
      let nextActive = state.activeFileId;

      if (state.activeFileId === id) {
        nextActive =
          openFiles.length > 0
            ? openFiles[openFiles.length - 1]
            : files[0]?.id || null;
      }

      if (nextActive) {
        const file = files.find((f) => f.id === nextActive);
        if (file) {
          useEditorStore.getState().setLanguage(file.language);
          if (file.content !== undefined) {
            useEditorStore.getState().setCode(file.content);
          }
        }
      }

      return {
        files,
        openFiles,
        activeFileId: nextActive,
      };
    });
    get().scheduleAutoSave();
  },

  /**
   * Project Management Operations
   */
  createNewProject: async (name, templateId = "blank") => {
    const template = PROJECT_TEMPLATES[templateId] || PROJECT_TEMPLATES.blank;
    const projectFiles = template.files.map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      language: getLanguageFromFilename(f.name),
      content: f.content,
    }));

    const newProject = createProjectMetadata({
      name: name || template.name,
      files: projectFiles,
      activeFileId: projectFiles[0]?.id,
      openFiles: projectFiles.map((f) => f.id),
    });

    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    saveActiveProjectToStorage(newProject);
    await gitService.syncFiles(newProject.files);

    set({
      currentProject: newProject,
      files: newProject.files,
      openFiles: newProject.openFiles,
      activeFileId: newProject.activeFileId,
      recentlyEditedFiles: newProject.files.map((f) => f.name),
      recentProjects: getRecentProjects(),
      hasUnsavedChanges: false,
      saveStatus: "saved",
    });

    if (newProject.files[0]) {
      useEditorStore.getState().setLanguage(newProject.files[0].language);
      useEditorStore.getState().setCode(newProject.files[0].content || "");
    }
  },

  openRecentProject: async (projectData) => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    const project = createProjectMetadata({
      id: projectData.id,
      name: projectData.name,
      files: projectData.files || [],
      activeFileId: projectData.activeFileId,
      openFiles: projectData.openFiles,
    });

    saveActiveProjectToStorage(project);
    await gitService.syncFiles(project.files);

    set({
      currentProject: project,
      files: project.files,
      openFiles: project.openFiles,
      activeFileId: project.activeFileId,
      recentlyEditedFiles: project.files.map((f) => f.name),
      recentProjects: getRecentProjects(),
      hasUnsavedChanges: false,
      saveStatus: "saved",
    });

    const activeFile = project.files.find((f) => f.id === project.activeFileId) || project.files[0];
    if (activeFile) {
      useEditorStore.getState().setLanguage(activeFile.language);
      useEditorStore.getState().setCode(activeFile.content || "");
    }
  },

  removeRecentProject: (projectId) => {
    const updated = removeRecentFromStorage(projectId);
    set({ recentProjects: updated });
  },

  saveCurrentProject: async () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    set({ saveStatus: "saving" });

    const state = get();
    const updatedProject = {
      ...state.currentProject,
      updatedAt: new Date().toISOString(),
      files: state.files,
      activeFileId: state.activeFileId,
      openFiles: state.openFiles,
    };

    saveActiveProjectToStorage(updatedProject);
    await gitService.syncFiles(state.files);

    set({
      currentProject: updatedProject,
      recentProjects: getRecentProjects(),
      hasUnsavedChanges: false,
      saveStatus: "saved",
    });
  },

  exportAsZip: async () => {
    const state = get();
    const project = {
      ...state.currentProject,
      files: state.files,
    };
    await exportProjectZip(project);
  },

  exportAsJson: () => {
    const state = get();
    const project = {
      ...state.currentProject,
      updatedAt: new Date().toISOString(),
      files: state.files,
      activeFileId: state.activeFileId,
      openFiles: state.openFiles,
    };
    exportProjectFile(project);
  },

  importFromZip: async (file) => {
    const importedProject = await importProjectZip(file);
    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    saveActiveProjectToStorage(importedProject);
    await gitService.syncFiles(importedProject.files);

    set({
      currentProject: importedProject,
      files: importedProject.files,
      openFiles: importedProject.openFiles,
      activeFileId: importedProject.activeFileId,
      recentlyEditedFiles: importedProject.files.map((f) => f.name),
      recentProjects: getRecentProjects(),
      hasUnsavedChanges: false,
      saveStatus: "saved",
    });

    const activeFile = importedProject.files[0];
    if (activeFile) {
      useEditorStore.getState().setLanguage(activeFile.language);
      useEditorStore.getState().setCode(activeFile.content || "");
    }
  },

  importFromJson: async (file) => {
    const importedProject = await parseProjectFile(file);
    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    saveActiveProjectToStorage(importedProject);
    await gitService.syncFiles(importedProject.files);

    set({
      currentProject: importedProject,
      files: importedProject.files,
      openFiles: importedProject.openFiles,
      activeFileId: importedProject.activeFileId,
      recentlyEditedFiles: importedProject.files.map((f) => f.name),
      recentProjects: getRecentProjects(),
      hasUnsavedChanges: false,
      saveStatus: "saved",
    });

    const activeFile = importedProject.files[0];
    if (activeFile) {
      useEditorStore.getState().setLanguage(activeFile.language);
      useEditorStore.getState().setCode(activeFile.content || "");
    }
  },
}));

export default useWorkspaceStore;