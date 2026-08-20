/**
 * PixelIDE Project Service (Sprint 13)
 * Provides serialization, deserialization, ZIP archiving, ZIP extraction,
 * path traversal validation, project metadata, templates, and recent projects persistence.
 */

import JSZip from "jszip";

const RECENT_PROJECTS_KEY = "pixelide_recent_projects";
const ACTIVE_PROJECT_KEY = "pixelide_active_project";

export const PROJECT_TEMPLATES = {
  blank: {
    id: "blank",
    name: "Blank Project",
    description: "Empty workspace starter",
    files: [
      {
        name: "main.txt",
        content: "Welcome to your new blank Pix project!\n",
      },
    ],
  },
  javascript: {
    id: "javascript",
    name: "JavaScript",
    description: "Node.js / JS application template",
    files: [
      {
        name: "index.js",
        content: `// JavaScript Application\nfunction greet(name) {\n  console.log(\`Hello \${name} from Pix IDE!\`);\n}\n\ngreet("Developer");\n`,
      },
      {
        name: "package.json",
        content: `{\n  "name": "pix-js-app",\n  "version": "1.0.0",\n  "description": "Created with Pix IDE",\n  "main": "index.js"\n}\n`,
      },
      {
        name: "README.md",
        content: `# JavaScript Project\n\nCreated with Pix IDE Sprint 13.\n`,
      },
    ],
  },
  python: {
    id: "python",
    name: "Python",
    description: "Python application starter",
    files: [
      {
        name: "main.py",
        content: `# Python Application\ndef main():\n    print("Hello from Pix IDE Python Project!")\n\nif __name__ == "__main__":\n    main()\n`,
      },
      {
        name: "requirements.txt",
        content: `# Dependencies list\n`,
      },
      {
        name: "README.md",
        content: `# Python Project\n\nCreated with Pix IDE Sprint 13.\n`,
      },
    ],
  },
  web: {
    id: "web",
    name: "Web Portfolio / App",
    description: "HTML, CSS, and JS web page starter",
    files: [
      {
        name: "index.html",
        content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Pix Web App</title>\n  <link rel="stylesheet" href="style.css" />\n</head>\n<body>\n  <div className="container">\n    <h1>Welcome to Pix IDE</h1>\n    <p>Edit HTML, CSS, and JavaScript in real-time!</p>\n  </div>\n  <script src="app.js"></script>\n</body>\n</html>\n`,
      },
      {
        name: "style.css",
        content: `body {\n  margin: 0;\n  font-family: system-ui, -apple-system, sans-serif;\n  background: #0f172a;\n  color: #f8fafc;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}\n\n.container {\n  text-align: center;\n  padding: 2rem;\n  border-radius: 1rem;\n  background: #1e293b;\n  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);\n}\n`,
      },
      {
        name: "app.js",
        content: `console.log("Pix Web App script executed successfully!");\n`,
      },
      {
        name: "README.md",
        content: `# Web Application\n\nCreated with Pix IDE Sprint 13.\n`,
      },
    ],
  },
};

export const getLanguageFromFilename = (filename) => {
  if (!filename) return "plaintext";
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "py":
      return "python";
    case "cpp":
    case "cc":
    case "cxx":
    case "h":
    case "hpp":
      return "cpp";
    case "c":
      return "c";
    case "java":
      return "java";
    case "html":
    case "htm":
      return "html";
    case "css":
      return "css";
    case "json":
      return "json";
    case "md":
    case "markdown":
      return "markdown";
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    default:
      return "javascript";
  }
};

/**
 * Generates a structured project metadata object.
 */
export const createProjectMetadata = ({
  id = crypto.randomUUID(),
  name = "Pix Project",
  files = [],
  activeFileId = null,
  openFiles = [],
  settings = {},
} = {}) => {
  const now = new Date().toISOString();
  return {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    files,
    activeFileId: activeFileId || files[0]?.id || null,
    openFiles: openFiles.length > 0 ? openFiles : (files[0] ? [files[0].id] : []),
    settings: {
      theme: "vs-dark",
      language: files[0] ? getLanguageFromFilename(files[0].name) : "javascript",
      fontSize: 14,
      ...settings,
    },
  };
};

/**
 * Recent Projects Local Storage Operations
 */
export const getRecentProjects = () => {
  try {
    const raw = localStorage.getItem(RECENT_PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addRecentProject = (project) => {
  try {
    if (!project || !project.id) return;
    const existing = getRecentProjects();
    const entry = {
      id: project.id,
      name: project.name || "Untitled Project",
      lastOpened: new Date().toISOString(),
      fileCount: project.files ? project.files.length : 0,
      files: project.files || [],
      activeFileId: project.activeFileId || null,
      openFiles: project.openFiles || [],
      settings: project.settings || {},
    };

    const updated = [entry, ...existing.filter((p) => p.id !== project.id)].slice(0, 15);
    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to update recent projects in localStorage:", err);
  }
};

export const removeRecentProject = (projectId) => {
  try {
    const existing = getRecentProjects();
    const updated = existing.filter((p) => p.id !== projectId);
    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const saveActiveProjectToStorage = (project) => {
  try {
    localStorage.setItem(ACTIVE_PROJECT_KEY, JSON.stringify(project));
    addRecentProject(project);
  } catch (err) {
    console.warn("Failed to persist active project state:", err);
  }
};

export const getActiveProjectFromStorage = () => {
  try {
    const raw = localStorage.getItem(ACTIVE_PROJECT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * ZIP Export
 */
export const exportProjectZip = async (project) => {
  const zip = new JSZip();
  const folderName = (project.name || "pix-project").toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  const root = zip.folder(folderName);

  (project.files || []).forEach((file) => {
    root.file(file.name, file.content || "");
  });

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${folderName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * ZIP Import with Path Traversal Security Validation
 */
export const importProjectZip = async (file) => {
  if (!file) throw new Error("No ZIP file provided");

  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  // Security Check 1: Validate entries for path traversal vulnerabilities
  const entries = Object.keys(zip.files);
  const isUnsafe = entries.some((path) => {
    const normalized = path.replace(/\\/g, "/");
    return (
      normalized.includes("../") ||
      normalized.includes("/..") ||
      normalized.startsWith("../") ||
      normalized.startsWith("/")
    );
  });

  if (isUnsafe) {
    throw new Error("Security Alert: Malicious ZIP payload containing path traversal attempt detected!");
  }

  const files = [];
  const openFiles = [];

  for (const relativePath of entries) {
    const entry = zip.files[relativePath];
    if (entry.dir) continue;

    // Remove top-level folder name if zip has a single root directory
    const pathParts = relativePath.split("/").filter(Boolean);
    const fileName = pathParts.length > 1 ? pathParts.slice(1).join("/") : pathParts[0];

    if (!fileName || fileName.startsWith(".")) continue;

    const content = await entry.async("string");
    const fileId = crypto.randomUUID();
    const language = getLanguageFromFilename(fileName);

    const fileObj = {
      id: fileId,
      name: fileName,
      language,
      content,
    };

    files.push(fileObj);
    openFiles.push(fileId);
  }

  if (files.length === 0) {
    throw new Error("The imported ZIP file contains no readable text files.");
  }

  const projectName = file.name.replace(/\.zip$/i, "").replace(/[-_]/g, " ");

  return createProjectMetadata({
    name: projectName,
    files,
    activeFileId: files[0].id,
    openFiles,
  });
};

/**
 * JSON Export (.pixproject / .pixel)
 */
export const exportProjectFile = (projectPayload) => {
  const name = projectPayload.name || "PixelIDE-Project";
  const jsonString = JSON.stringify(projectPayload, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${name.toLowerCase().replace(/[^a-z0-9_-]/g, "_")}.pixproject`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * JSON Import (.pixproject / .pixel)
 */
export const parseProjectFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No project file selected"));

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const parsed = JSON.parse(content);

        if (!parsed || !Array.isArray(parsed.files)) {
          throw new Error("Invalid project file structure");
        }

        const project = createProjectMetadata({
          id: parsed.id || crypto.randomUUID(),
          name: parsed.name || file.name.replace(/\.(pixproject|pixel|json)$/i, ""),
          files: parsed.files.map((f) => ({
            id: f.id || crypto.randomUUID(),
            name: f.name || "untitled",
            language: f.language || getLanguageFromFilename(f.name),
            content: f.content !== undefined ? f.content : "",
          })),
          activeFileId: parsed.activeFileId,
          openFiles: parsed.openFiles,
          settings: parsed.settings,
        });

        resolve(project);
      } catch (err) {
        reject(new Error("Failed to parse project file: " + err.message));
      }
    };

    reader.onerror = () => reject(new Error("Error reading project file"));
    reader.readAsText(file);
  });
};
