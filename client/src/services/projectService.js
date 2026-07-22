/**
 * Service for handling PixelIDE project saving and loading (.pixel format).
 */

export const exportProjectFile = (workspaceState) => {
  const { files, openFiles, activeFileId } = workspaceState;

  const projectPayload = {
    version: "1.0",
    name: "PixelIDE-Project",
    savedAt: new Date().toISOString(),
    activeFileId,
    openFiles,
    files,
  };

  const jsonString = JSON.stringify(projectPayload, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `project_${Date.now()}.pixel`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseProjectFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const parsed = JSON.parse(content);

        if (!parsed || !Array.isArray(parsed.files)) {
          throw new Error("Invalid .pixel project file structure");
        }

        resolve({
          files: parsed.files || [],
          openFiles: parsed.openFiles || (parsed.files[0] ? [parsed.files[0].id] : []),
          activeFileId: parsed.activeFileId || parsed.files[0]?.id || null,
        });
      } catch (err) {
        reject(new Error("Failed to parse .pixel project file: " + err.message));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading project file"));
    };

    reader.readAsText(file);
  });
};
