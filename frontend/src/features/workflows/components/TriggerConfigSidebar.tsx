import { useState } from 'react';
import { X } from 'lucide-react';
import { useWorkflowStore } from '../../../store/workflowStore';

export default function TriggerConfigSidebar({ onClose }: { onClose: () => void }) {
  const { id, triggerType, cronExpression, testPayload, setTriggerType, setCronExpression, setTestPayload } = useWorkflowStore();

  const parseCron = (cron: string | undefined) => {
    if (!cron) return { value: 1, unit: 'hours' };
    const parts = cron.split(' ');
    if (parts[0] === '*') return { value: 1, unit: 'minutes' };
    if (parts[0]?.startsWith('*/')) return { value: parseInt(parts[0].substring(2)), unit: 'minutes' };
    if (parts[0] === '0' && parts[1] === '*') return { value: 1, unit: 'hours' };
    if (parts[0] === '0' && parts[1]?.startsWith('*/')) return { value: parseInt(parts[1].substring(2)), unit: 'hours' };
    if (parts[0] === '0' && parts[1] === '0' && parts[2] === '*') return { value: 1, unit: 'days' };
    if (parts[0] === '0' && parts[1] === '0' && parts[2]?.startsWith('*/')) return { value: parseInt(parts[2].substring(2)), unit: 'days' };
    return { value: 1, unit: 'hours' };
  };

  const initialCron = parseCron(cronExpression);
  const [intervalValue, setIntervalValue] = useState(initialCron.value);
  const [intervalUnit, setIntervalUnit] = useState(initialCron.unit);

  const handleCronChange = (v: number, u: string) => {
    setIntervalValue(v);
    setIntervalUnit(u);
    
    const val = Math.max(1, v);
    let cron = '0 * * * *';
    if (u === 'minutes') cron = val === 1 ? '* * * * *' : `*/${val} * * * *`;
    else if (u === 'hours') cron = val === 1 ? '0 * * * *' : `0 */${val} * * *`;
    else if (u === 'days') cron = val === 1 ? '0 0 * * *' : `0 0 */${val} * *`;
    
    setCronExpression(cron);
  };

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
              <option value="CRON">Scheduled (Timer)</option>
              <option value="MANUAL">Manual Execution</option>
            </select>
          </div>

          {triggerType === 'WEBHOOK' || triggerType === 'MANUAL' ? (
            <div className="space-y-6">
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
              
              {triggerType === 'WEBHOOK' && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-2 mt-4">
                  <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    How to use Webhooks
                  </h3>
                  <ul className="text-xs text-blue-100/70 space-y-1.5 list-disc list-inside">
                    <li>Copy the URL above.</li>
                    <li>Paste it into the webhook settings of any third-party app (Stripe, GitHub, Shopify, etc).</li>
                    <li>When that app sends an HTTP POST request to this URL, your workflow will run automatically.</li>
                    <li>The raw JSON payload from the request will be available as <code className="text-blue-300 bg-blue-500/20 px-1 py-0.5 rounded">{'{{trigger.body}}'}</code>.</li>
                  </ul>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Default Test Payload (JSON)</label>
                <textarea
                  value={testPayload || ''}
                  onChange={(e) => setTestPayload(e.target.value)}
                  placeholder={'{\n  "key": "value"\n}'}
                  rows={6}
                  className="input-field font-mono text-sm resize-none"
                />
                <p className="text-xs text-white/40">This JSON will automatically populate the 'Run Now' modal.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Run Every</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    min="1"
                    value={intervalValue}
                    onChange={(e) => handleCronChange(parseInt(e.target.value) || 1, intervalUnit)}
                    className="input-field w-24"
                  />
                  <select 
                    value={intervalUnit}
                    onChange={(e) => handleCronChange(intervalValue, e.target.value)}
                    className="input-field flex-1"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
                <p className="text-xs text-white/40 mt-1">
                  Generated Cron: <code className="bg-black/40 px-1 rounded font-mono text-white/60">{cronExpression || '0 * * * *'}</code>
                </p>
              </div>
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
