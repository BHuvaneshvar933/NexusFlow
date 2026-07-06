import { X } from 'lucide-react';
import { useWorkflowStore } from '../../../store/workflowStore';

export default function TriggerConfigSidebar({ onClose }: { onClose: () => void }) {
  const { id, triggerType, cronExpression, setTriggerType, setCronExpression } = useWorkflowStore();

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 h-full w-[400px] glass-panel border-l border-surface-border bg-[#0a0a0a]/95 z-50 p-6 flex flex-col shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-white">Configure Trigger</h2>
            <p className="text-white/50 text-sm mt-1">How should this workflow start?</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Trigger Type</label>
            <select 
              value={triggerType} 
              onChange={(e) => setTriggerType(e.target.value)}
              className="input-field"
            >
              <option value="WEBHOOK">Webhook API</option>
              <option value="CRON">Scheduled (Cron)</option>
              <option value="MANUAL">Manual Execution</option>
            </select>
          </div>

          {triggerType === 'WEBHOOK' || triggerType === 'MANUAL' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Webhook URL</label>
              {id ? (
                <div className="w-full bg-black/40 border border-white/10 rounded-md p-3">
                  <code className="text-xs text-primary font-mono select-all break-all">
                    {`${window.location.protocol}//${window.location.hostname}:3000/api/webhooks/${id}`}
                  </code>
                </div>
              ) : (
                <p className="text-xs text-orange-400/80 italic">Save this workflow to generate its unique Webhook URL.</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Cron Expression</label>
              <input 
                type="text" 
                value={cronExpression || ''}
                onChange={(e) => setCronExpression(e.target.value)}
                placeholder="e.g. 0 * * * * (Hourly)"
                className="input-field font-mono text-sm"
              />
              <p className="text-xs text-white/40">Standard cron syntax (minute hour day month day-of-week)</p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-surface-border mt-auto">
          <button onClick={onClose} className="btn-primary w-full justify-center">
            Done
          </button>
        </div>
      </div>
    </>
  );
}
