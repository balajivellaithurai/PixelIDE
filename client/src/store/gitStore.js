/**
 * Zustand Store for Git Source Control (Sprint 12)
 * Connects Git UI panels, Monaco Diff Viewer, Status Bar, and real gitService backend APIs.
 */

import { create } from "zustand";
import gitService from "../services/gitService";

const useGitStore = create((set, get) => ({
  isGitRepo: true,
  currentBranch: "main",
  branches: ["main"],
  staged: [],
  unstaged: [],
  commitMessage: "",
  isCommitting: false,
  isLoading: false,
  error: null,
  commitHistory: [],
  activeDiffFile: null,

  setCommitMessage: (commitMessage) => set({ commitMessage }),

  refreshGitStatus: async (files = []) => {
    try {
      const statusData = await gitService.getStatus(files);
      if (!statusData.isGitRepo) {
        set({
          isGitRepo: false,
          currentBranch: "",
          branches: [],
          staged: [],
          unstaged: [],
          commitHistory: [],
          error: null,
        });
        return;
      }

      const [branchesData, historyData] = await Promise.all([
        gitService.getBranches().catch(() => ({ branches: [statusData.currentBranch || "main"] })),
        gitService.getCommitHistory().catch(() => []),
      ]);

      set({
        isGitRepo: true,
        currentBranch: statusData.currentBranch || "main",
        staged: statusData.staged || [],
        unstaged: statusData.unstaged || [],
        branches: branchesData.branches || [statusData.currentBranch || "main"],
        commitHistory: historyData || [],
        error: null,
      });
    } catch (err) {
      console.error("[Git Store Refresh Error]", err);
      set({ error: err.message });
    }
  },

  initRepo: async (files = []) => {
    set({ isLoading: true, error: null });
    try {
      await gitService.initRepo();
      await get().refreshGitStatus(files);
      set({ isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  stageFile: async (fileId, files = []) => {
    try {
      await gitService.stageFile(fileId, files);
      await get().refreshGitStatus(files);
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  unstageFile: async (fileId, files = []) => {
    try {
      await gitService.unstageFile(fileId);
      await get().refreshGitStatus(files);
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  stageAll: async (files = []) => {
    try {
      await gitService.stageAll(files);
      await get().refreshGitStatus(files);
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  unstageAll: async (files = []) => {
    try {
      await gitService.unstageAll();
      await get().refreshGitStatus(files);
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  commit: async (files = []) => {
    const { commitMessage } = get();
    if (!commitMessage || !commitMessage.trim()) {
      throw new Error("Commit message cannot be empty.");
    }
    set({ isCommitting: true, error: null });
    try {
      await gitService.commit(commitMessage, files);
      set({ commitMessage: "", isCommitting: false });
      await get().refreshGitStatus(files);
    } catch (err) {
      set({ isCommitting: false, error: err.message });
      throw err;
    }
  },

  createBranch: async (name, files = []) => {
    try {
      await gitService.createBranch(name, files);
      await get().refreshGitStatus(files);
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  switchBranch: async (name, files = []) => {
    try {
      await gitService.switchBranch(name, files);
      await get().refreshGitStatus(files);
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteBranch: async (name, files = []) => {
    try {
      await gitService.deleteBranch(name);
      await get().refreshGitStatus(files);
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  openDiff: async (file) => {
    try {
      if (file.originalContent !== undefined && file.modifiedContent !== undefined) {
        set({ activeDiffFile: file });
        return;
      }
      const filePath = file.path || file.name || file.id;
      const diffData = await gitService.getFileDiff(filePath);
      set({
        activeDiffFile: {
          fileId: file.id || filePath,
          name: file.name || filePath,
          language: file.language || "javascript",
          originalContent: diffData.originalContent,
          modifiedContent: diffData.modifiedContent,
        },
      });
    } catch (err) {
      console.error("[Open Diff Error]", err);
      set({
        activeDiffFile: {
          fileId: file.id || file.name,
          name: file.name,
          language: file.language || "javascript",
          originalContent: "// Failed to load original content",
          modifiedContent: file.content || "",
        },
      });
    }
  },

  closeDiff: () => set({ activeDiffFile: null }),
}));

export default useGitStore;
