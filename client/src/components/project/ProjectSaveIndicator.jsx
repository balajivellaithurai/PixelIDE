import { FiCheck, FiRefreshCw, FiAlertCircle } from "react-icons/fi";
import useWorkspaceStore from "../../store/workspaceStore";

export default function ProjectSaveIndicator() {
  const { saveStatus, hasUnsavedChanges } = useWorkspaceStore();

  if (saveStatus === "saving") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono select-none px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md">
        <FiRefreshCw className="animate-spin text-xs shrink-0" />
        <span>Saving...</span>
      </div>
    );
  }

  if (hasUnsavedChanges || saveStatus === "unsaved") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono select-none px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md">
        <FiAlertCircle className="text-xs shrink-0" />
        <span>Unsaved</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono select-none px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
      <FiCheck className="text-xs shrink-0" />
      <span>Saved</span>
    </div>
  );
}
