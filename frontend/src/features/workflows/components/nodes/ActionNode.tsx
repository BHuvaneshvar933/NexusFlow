import { Handle, Position } from '@xyflow/react';
import { Mail, BrainCircuit, Database, Globe, Code2, Filter, Plus, Trash2 } from 'lucide-react';

const ACTION_UI: Record<string, any> = {
  SEND_EMAIL: { icon: <Mail className="w-5 h-5 text-blue-500" />, title: 'Send Email', bg: 'border-blue-500/20 bg-blue-500/10' },
  AI_ANALYZE: { icon: <BrainCircuit className="w-5 h-5 text-purple-500" />, title: 'AI Analysis', bg: 'border-purple-500/20 bg-purple-500/10' },
  SAVE_TO_DB: { icon: <Database className="w-5 h-5 text-green-500" />, title: 'Save to DB', bg: 'border-green-500/20 bg-green-500/10' },
  HTTP_REQUEST: { icon: <Globe className="w-5 h-5 text-orange-500" />, title: 'HTTP Request', bg: 'border-orange-500/20 bg-orange-500/10' },
  CUSTOM_CODE: { icon: <Code2 className="w-5 h-5 text-pink-500" />, title: 'Custom Code', bg: 'border-pink-500/20 bg-pink-500/10' },
  CONDITION: { icon: <Filter className="w-5 h-5 text-yellow-600" />, title: 'Condition', bg: 'border-yellow-500/20 bg-yellow-500/10' },
};

export default function ActionNode({ data }: { data: any }) {
  const ui = ACTION_UI[data.action.actionType] || { icon: <Code2 className="w-5 h-5 text-foreground/50" />, title: 'Unknown', bg: 'border-surface-border bg-surface' };

  return (
    <div className="relative group">
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-primary border-2 border-white" 
      />
      
      <div 
        className={`w-64 rounded-xl border shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all relative ${ui.bg}`}
        onClick={data.onClick}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); data.onDelete(); }}
          className="absolute top-3 right-3 p-1.5 rounded-md bg-surface text-foreground/50 hover:text-red-500 hover:bg-red-500/10 border border-surface-border transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
          title="Delete action"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-surface shadow-sm border border-surface-border">
            {ui.icon}
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">{ui.title}</h3>
            <p className="text-[10px] font-mono text-muted uppercase">Step {data.action.sequence}</p>
          </div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-primary border-2 border-white" 
      />

      {data.isLast && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); data.onAddNext(); }}
            className="w-8 h-8 rounded-full bg-primary hover:bg-primary-hover flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 z-10 relative"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
