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

const AI_ACTIONS_CONFIG = [
  {
    id: AIActionType.REVIEW,
    title: "Review Code",
    description: "Analyze code quality and best practices.",
    icon: FiCheckSquare,
    handler: (code, lang) => aiService.reviewCode(code, lang),
  },
  {
    id: AIActionType.DEBUG,
    title: "Debug Error",
    description: "Identify bugs and explain fixes.",
    icon: FiTerminal,
    handler: (code, lang, output) => aiService.debugError(code, lang, output),
  },
  {
    id: AIActionType.EXPLAIN,
    title: "Explain Selection",
    description: "Explain highlighted code.",
    icon: FiHelpCircle,
    handler: (code, lang) => aiService.explainSelection(code, lang),
  },
  {
    id: AIActionType.OPTIMIZE,
    title: "Optimize Code",
    description: "Suggest cleaner and faster code.",
    icon: FiZap,
    handler: (code, lang) => aiService.optimizeCode(code, lang),
  },
  {
    id: AIActionType.TESTS,
    title: "Generate Tests",
    description: "Create unit tests.",
    icon: FiLayers,
    handler: (code, lang) => aiService.generateTests(code, lang),
  },
  {
    id: AIActionType.DOCS,
    title: "Generate Docs",
    description: "Generate documentation comments.",
    icon: FiFileText,
    handler: (code, lang) => aiService.generateDocs(code, lang),
  },
];

export default function AIActions() {
  const { selectedAction, isLoading } = useAIStore();
  const { code, language, output } = useEditorStore();

  const handleCardClick = async (action) => {
    if (isLoading) return;
    try {
      await action.handler(code, language, output);
    } catch (_) {
      // Errors handled gracefully by aiStore
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
