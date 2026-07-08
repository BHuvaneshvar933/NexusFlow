import { Handle, Position } from '@xyflow/react';
import { Zap, Webhook, Clock, FileText, MousePointerClick, Plus } from 'lucide-react';

const TRIGGER_ICONS: Record<string, any> = {
  WEBHOOK: <Webhook className="w-5 h-5 text-blue-400" />,
  CRON: <Clock className="w-5 h-5 text-purple-400" />,
  RESUME_UPLOAD: <FileText className="w-5 h-5 text-green-400" />,
  MANUAL: <MousePointerClick className="w-5 h-5 text-orange-400" />
};

export default function TriggerNode({ data }: { data: any }) {
  const Icon = TRIGGER_ICONS[data.type] || <Zap className="w-5 h-5 text-yellow-400" />;

  return (
    <div 
      className="glass-panel w-64 rounded-xl border-surface-border shadow-2xl overflow-hidden cursor-pointer hover:border-white/20 transition-colors relative group"
      onClick={data.onClick}
    >
      <div className="bg-surface-border/50 p-3 flex items-center gap-3 border-b border-surface-border/50">
        <div className="p-2 rounded-lg bg-white/5">
          {Icon}
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">Trigger</h3>
          <p className="text-xs text-white/50">{(data.type || 'UNKNOWN').replace(/_/g, ' ')}</p>
        </div>
      </div>
      <div className="p-3 text-xs text-white/70">
        {data.type === 'WEBHOOK' && <span className="font-mono bg-black/50 px-1 rounded truncate block">/api/webhooks/xxxx</span>}
        {data.type === 'CRON' && <span className="font-mono bg-black/50 px-1 rounded">{data.cronExpression || 'Not set'}</span>}
        {data.type === 'MANUAL' && <span>Click 'Execute' to run</span>}
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-blue-500 border-2 border-black" 
      />

      {data.onAddNext && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); data.onAddNext(); }}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 z-10 relative"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
