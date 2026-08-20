import { FiAlertTriangle, FiSave, FiTrash2, FiX } from "react-icons/fi";
import useWorkspaceStore from "../../store/workspaceStore";
import toast from "react-hot-toast";

export default function UnsavedChangesModal() {
  const {
    showUnsavedModal,
    setShowUnsavedModal,
    saveCurrentProject,
    pendingAction,
    setPendingAction,
  } = useWorkspaceStore();

  if (!showUnsavedModal) return null;

  const handleSave = async () => {
    try {
      await saveCurrentProject();
      toast.success("Project saved successfully!");
      setShowUnsavedModal(false);
      if (pendingAction) {
        const action = pendingAction;
        setPendingAction(null);
        action();
      }
    } catch (err) {
      toast.error(err.message || "Failed to save project");
    }
  };

  const handleDiscard = () => {
    setShowUnsavedModal(false);
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      action();
    }
  };

  const handleCancel = () => {
    setShowUnsavedModal(false);
    setPendingAction(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-base">
            <FiAlertTriangle className="text-xl shrink-0" />
            <span>Unsaved Changes</span>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition cursor-pointer"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          You have unsaved changes in your active workspace project. Do you want to save your progress before continuing?
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={handleCancel}
            className="px-3.5 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-xs font-medium text-neutral-300 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDiscard}
            className="px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
          >
            <FiTrash2 className="text-xs" />
            <span>Discard</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition cursor-pointer flex items-center gap-1.5"
          >
            <FiSave className="text-xs" />
            <span>Save Project</span>
          </button>
        </div>
      </div>
    </div>
  );
}
