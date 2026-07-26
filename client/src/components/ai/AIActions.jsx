import {
  FiCheckSquare,
  FiTerminal,
  FiHelpCircle,
  FiZap,
  FiLayers,
  FiFileText,
} from "react-icons/fi";
import AIActionCard from "./AIActionCard";
import useAIStore, { AIActionType } from "../../store/aiStore";
import useEditorStore from "../../store/editorStore";
import aiService from "../../services/aiService";
import { AIError, AIErrorType } from "../../ai/errors/aiErrors";

const AI_ACTIONS_CONFIG = [
  {
    id: AIActionType.REVIEW,
    title: "Review Code",
    description: "Analyze code quality and best practices.",
    icon: FiCheckSquare,
    handler: () => aiService.reviewCode(),
  },
  {
    id: AIActionType.DEBUG,
    title: "Debug Error",
    description: "Analyze Judge0 errors and suggest fixes.",
    icon: FiTerminal,
    handler: () => aiService.debugError(),
  },
  {
    id: AIActionType.EXPLAIN,
    title: "Explain Selection",
    description: "Explain highlighted snippet or full file.",
    icon: FiHelpCircle,
    handler: () => aiService.explainSelection(),
  },
  {
    id: AIActionType.OPTIMIZE,
    title: "Optimize Code",
    description: "Suggest cleaner and faster code.",
    icon: FiZap,
    handler: () => aiService.optimizeCode(),
  },
  {
    id: AIActionType.TESTS,
    title: "Generate Tests",
    description: "Create language-specific unit tests.",
    icon: FiLayers,
    handler: () => aiService.generateTests(),
  },
  {
    id: AIActionType.DOCS,
    title: "Generate Docs",
    description: "Generate technical documentation.",
    icon: FiFileText,
    handler: () => aiService.generateDocs(),
  },
];

export default function AIActions() {
  const { selectedAction, isLoading, setError } = useAIStore();
  const { code } = useEditorStore();

  const handleCardClick = async (action) => {
    if (isLoading) return;

    // Empty Editor Validation Guard
    if (!code || !code.trim()) {
      setError(
        null,
        new AIError(
          AIErrorType.EMPTY_REQUEST,
          "Start writing code before using AI."
        )
      );
      return;
    }

    try {
      await action.handler();
    } catch {
      // Error state handled by aiStore
    }
  };

  return (
    <div className="p-4 space-y-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          AI Tools
        </span>
        <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
          6 Actions Available
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {AI_ACTIONS_CONFIG.map((action) => (
          <AIActionCard
            key={action.id}
            title={action.title}
            description={action.description}
            icon={action.icon}
            isSelected={selectedAction === action.id}
            isLoading={isLoading}
            onClick={() => handleCardClick(action)}
          />
        ))}
      </div>
    </div>
  );
}
