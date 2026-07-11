import { Settings2, Trash2, Mail, BrainCircuit, Database, GripVertical, Repeat } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useWorkflowStore, type ActionConfig } from '../../../store/workflowStore';

const ActionIcons: Record<string, React.ReactNode> = {
  SEND_EMAIL: <Mail className="w-5 h-5" />,
  AI_ANALYZE: <BrainCircuit className="w-5 h-5" />,
  SAVE_TO_DB: <Database className="w-5 h-5" />,
  ITERATOR: <Repeat className="w-5 h-5" />,
};

const ActionColors: Record<string, string> = {
  SEND_EMAIL: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  AI_ANALYZE: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  SAVE_TO_DB: 'bg-green-500/20 text-green-400 border-green-500/30',
  ITERATOR: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

interface ActionNodeProps {
  action: ActionConfig;
  index: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function ActionNode({ action, index, isSelected, onSelect }: ActionNodeProps) {
  const removeAction = useWorkflowStore((s) => s.removeAction);

  return (
    <div className="group relative flex items-center gap-4 w-full max-w-xl mx-auto animate-fade-in">
      {/* Sequence Number Indicator */}
      <div className="absolute -left-12 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white/50 border border-white/5">
        {index + 1}
      </div>

      <div 
        onClick={onSelect}
        className={cn(
          "flex-1 glass-panel p-4 flex items-center justify-between border transition-all cursor-pointer",
          ActionColors[action.actionType] || 'bg-white/5',
          isSelected ? 'border-primary shadow-lg shadow-primary/10' : 'hover:border-white/20'
        )}
      >
        
        <div className="flex items-center gap-4">
          {/* Drag Handle */}
          <button 
            className="text-white/30 hover:text-white/70 cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-5 h-5" />
          </button>
          
          <div className={cn("p-2 rounded-lg border", ActionColors[action.actionType])}>
            {ActionIcons[action.actionType] || <Settings2 className="w-5 h-5" />}
          </div>
          
          <div>
            <h3 className="font-medium text-white">{action.actionType.replace(/_/g, ' ')}</h3>
            <p className="text-xs text-white/50 mt-0.5">
              {Object.keys(action.config).length > 0 ? 'Configured' : 'Configure parameters in sidebar'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="p-2 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); removeAction(action.id); }}
            className="p-2 hover:bg-red-500/20 rounded-md text-white/50 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
