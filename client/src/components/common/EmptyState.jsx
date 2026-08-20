import { FiInbox } from "react-icons/fi";

export default function EmptyState({
  icon: Icon = FiInbox,
  title = "No Items Available",
  description = "There are no items to display at this time.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`p-6 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-950/40 flex flex-col items-center justify-center space-y-3 font-sans text-xs select-none ${className}`}
    >
      <div className="p-3 rounded-2xl bg-neutral-900 text-neutral-400 border border-neutral-800 shadow-inner">
        <Icon className="text-xl text-purple-400" />
      </div>

      <div className="space-y-1 max-w-xs">
        <h3 className="font-bold text-white text-xs tracking-tight">{title}</h3>
        <p className="text-[11px] text-neutral-400 leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-1 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition active:scale-95 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
