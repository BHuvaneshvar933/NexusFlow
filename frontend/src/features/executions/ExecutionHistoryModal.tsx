import { useQuery } from '@tanstack/react-query';
import { getExecutionsByWorkflowApi } from '../../services/execution';
import { X, Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function ExecutionHistoryModal({ workflowId, onClose }: { workflowId: string, onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['executions', workflowId],
    queryFn: () => getExecutionsByWorkflowApi(workflowId)
  });

  const [selectedExecution, setSelectedExecution] = useState<any>(null);

  const executions = data?.data || [];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] max-h-[80vh] glass-panel bg-[#0a0a0a] border-surface-border z-50 flex flex-col shadow-2xl animate-slide-up rounded-2xl overflow-hidden">
        
        <div className="p-6 border-b border-surface-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Execution History</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left: List of executions */}
          <div className="w-1/3 border-r border-surface-border overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : executions.length === 0 ? (
              <div className="p-8 text-center text-white/40">No runs yet.</div>
            ) : (
              <div className="divide-y divide-surface-border">
                {executions.map((exec: any) => (
                  <button 
                    key={exec.id} 
                    onClick={() => setSelectedExecution(exec)}
                    className={`w-full text-left p-4 hover:bg-white/5 transition-colors ${selectedExecution?.id === exec.id ? 'bg-white/5' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {exec.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : 
                       exec.status === 'failed' ? <XCircle className="w-4 h-4 text-red-400" /> : 
                       <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />}
                      <span className="font-medium text-white/90 capitalize">{exec.status}</span>
                    </div>
                    <div className="text-xs text-white/40 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(exec.startedAt).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Selected execution logs */}
          <div className="flex-1 bg-black/40 overflow-y-auto p-4 font-mono text-xs">
            {!selectedExecution ? (
              <div className="h-full flex items-center justify-center text-white/30">
                Select an execution to view logs
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-white/50 mb-4 border-b border-white/10 pb-2">
                  Execution ID: <span className="text-white/80">{selectedExecution.id}</span>
                </div>
                {selectedExecution.logs?.map((log: any, i: number) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white/30">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className="text-primary font-semibold">{log.step}</span>
                      <span className={`font-bold ${
                        log.status === 'STARTED' ? 'text-blue-400' :
                        log.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {log.status}
                      </span>
                      {log.durationMs && <span className="text-white/30">{log.durationMs}ms</span>}
                    </div>
                    {log.error && (
                      <div className="pl-24 text-red-400">Error: {log.error}</div>
                    )}
                    {log.data && (
                      <div className="pl-24 pr-4 mt-1">
                        <div className="bg-black/40 border border-white/5 rounded-md p-2 overflow-x-auto text-white/70 whitespace-pre-wrap font-mono text-[11px]">
                          {(() => {
                            try {
                              return JSON.stringify(log.data, null, 2);
                            } catch {
                              // ignore
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )) || <div className="text-white/40">No logs recorded.</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
