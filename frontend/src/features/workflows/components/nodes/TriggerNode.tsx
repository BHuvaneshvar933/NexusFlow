import { Handle, Position } from '@xyflow/react';
import { Zap, Webhook, Clock, FileText, MousePointerClick, Plus } from 'lucide-react';

const TRIGGER_ICONS: Record<string, any> = {
  WEBHOOK: <Webhook className="w-5 h-5 text-blue-500" />,
  CRON: <Clock className="w-5 h-5 text-purple-500" />,
  RESUME_UPLOAD: <FileText className="w-5 h-5 text-green-500" />,
  MANUAL: <MousePointerClick className="w-5 h-5 text-orange-500" />
};

export default function TriggerNode({ data }: { data: any }) {
  const Icon = TRIGGER_ICONS[data.type] || <Zap className="w-5 h-5 text-yellow-500" />;

  return (
    <div 
      className="bg-surface w-64 rounded-xl border border-surface-border shadow-md overflow-hidden cursor-pointer hover:border-primary/50 transition-colors relative group"
      onClick={data.onClick}
    >
      <div className="bg-background/50 p-3 flex items-center gap-3 border-b border-surface-border">
        <div className="p-2 rounded-lg bg-surface shadow-sm border border-surface-border">
          {Icon}
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">Trigger</h3>
          <p className="text-xs text-muted">{(data.type || 'UNKNOWN').replace(/_/g, ' ')}</p>
        </div>
      </div>
      <div className="p-3 text-xs text-foreground/80">
        {data.type === 'WEBHOOK' && <span className="font-mono bg-background text-foreground px-1 py-0.5 rounded truncate block border border-surface-border">/api/webhooks/xxxx</span>}
        {data.type === 'CRON' && <span className="font-mono bg-background text-foreground px-1 py-0.5 rounded border border-surface-border">{data.cronExpression || 'Not set'}</span>}
        {data.type === 'MANUAL' && <span>Click 'Execute' to run</span>}
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-primary border-2 border-white" 
      />

      {data.onAddNext && (
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
