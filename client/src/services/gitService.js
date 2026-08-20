/**
 * Git Source Control Service for Pix / PixelIDE (Sprint 12)
 * Connects directly to Express Backend Git Endpoints (/api/git/*).
 */

const API_BASE = "http://localhost:5000/api/git";

class GitService {
  /**
   * Syncs active workspace editor files to backend workspace directory.
   */
  async syncFiles(files = []) {
    try {
      const res = await fetch(`${API_BASE}/sync-files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });
      return await res.json();
    } catch (err) {
      console.warn("Failed to sync files with backend Git workspace:", err.message);
    }
  }

  /**
   * Evaluates current workspace Git status.
   * Syncs current files to disk first, then retrieves status from server.
   */
  async getStatus(files = []) {
    if (files.length > 0) {
      await this.syncFiles(files);
    }
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) {
      throw new Error(`Failed to fetch Git status (${res.status})`);
    }
    return await res.json();
  }

  /**
   * Initializes Git repository in current workspace.
   */
  async initRepo() {
    const res = await fetch(`${API_BASE}/init`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to initialize Git repository.");
    }
    return data;
  }

  async stageFile(fileId, files = []) {
    if (files.length > 0) await this.syncFiles(files);
    const res = await fetch(`${API_BASE}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath: fileId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to stage file.");
    return data;
  }

  async unstageFile(fileId) {
    const res = await fetch(`${API_BASE}/unstage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath: fileId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to unstage file.");
    return data;
  }

  async stageAll(files = []) {
    if (files.length > 0) await this.syncFiles(files);
    const res = await fetch(`${API_BASE}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to stage all files.");
    return data;
  }

  async unstageAll() {
    const res = await fetch(`${API_BASE}/unstage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to unstage all files.");
    return data;
  }

  async commit(message, files = []) {
    if (!message || !message.trim()) {
      throw new Error("Commit message cannot be empty.");
    }
    if (files.length > 0) await this.syncFiles(files);
    const res = await fetch(`${API_BASE}/commit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Commit failed.");
    return data;
  }

  async getBranches() {
    const res = await fetch(`${API_BASE}/branches`);
    if (!res.ok) throw new Error("Failed to fetch branches.");
    return await res.json();
  }

  async createBranch(branchName, files = []) {
    if (files.length > 0) await this.syncFiles(files);
    const res = await fetch(`${API_BASE}/branch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", name: branchName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create branch.");
    return data;
  }

  async switchBranch(branchName, files = []) {
    if (files.length > 0) await this.syncFiles(files);
    const res = await fetch(`${API_BASE}/branch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "switch", name: branchName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to switch branch.");
    return data;
  }

  async deleteBranch(branchName) {
    const res = await fetch(`${API_BASE}/branch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", name: branchName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete branch.");
    return data;
  }

  async getCommitHistory() {
    const res = await fetch(`${API_BASE}/history`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.commits || [];
  }

  async getFileDiff(filePath) {
    const res = await fetch(`${API_BASE}/diff?filePath=${encodeURIComponent(filePath)}`);
    if (!res.ok) throw new Error("Failed to load file diff.");
    return await res.json();
  }

  async getStagedDiff() {
    const res = await fetch(`${API_BASE}/staged-diff`);
    if (!res.ok) return { diff: "No staged diff available." };
    return await res.json();
  }
}

const gitService = new GitService();
export default gitService;
