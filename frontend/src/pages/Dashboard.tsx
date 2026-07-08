import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getWorkflowsApi, triggerWorkflowApi, deleteWorkflowApi } from '../services/workflow';
import { Activity, Loader2, Play, Pencil, Trash2, History } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import LiveLogsPanel from '../features/executions/LiveLogsPanel';
import ExecutionHistoryModal from '../features/executions/ExecutionHistoryModal';
import { X } from 'lucide-react';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { activeWorkspaceId } = useAuthStore();
  const { data, isLoading, error } = useQuery({
    queryKey: ['workflows', activeWorkspaceId],
    queryFn: getWorkflowsApi,
    enabled: !!activeWorkspaceId
  });
  
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeLogsExecutionId, setActiveLogsExecutionId] = useState<string | null>(null);
  const [historyWorkflowId, setHistoryWorkflowId] = useState<string | null>(null);

  const [triggerModalId, setTriggerModalId] = useState<string | null>(null);
  const [triggerPayload, setTriggerPayload] = useState<string>('{\n  "username": "torvalds"\n}');

  const executeTrigger = async () => {
    if (!triggerModalId) return;
    
    let parsedData = {};
    try {
      parsedData = JSON.parse(triggerPayload);
    } catch (e) {
      alert("Invalid JSON format");
      return;
    }

    setTriggeringId(triggerModalId);
    setActiveLogsExecutionId(null); 
    try {
      const res = await triggerWorkflowApi(triggerModalId, parsedData);
      // Ensure we have an executionId
      if (res.data?.executionId) {
        setActiveLogsExecutionId(res.data.executionId);
      }
      setTriggerModalId(null);
    } catch (err: any) {
      alert("Failed to trigger: " + err.message);
    } finally {
      setTriggeringId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this workflow?")) return;
    
    setDeletingId(id);
    try {
      await deleteWorkflowApi(id);
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const workflows = data?.data || [];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
        <p className="text-foreground/70 mt-2">Manage and monitor your automated background processes.</p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
          Failed to load workflows.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow: any) => (
            <div key={workflow.id} className="glass-panel p-6 flex flex-col gap-4 group hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setHistoryWorkflowId(workflow.id)}
                    className="p-1.5 hover:bg-surface-border rounded-md text-foreground/50 hover:text-foreground transition-colors"
                    title="Execution History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => navigate(`/workflows/${workflow.id}/edit`)}
                    className="p-1.5 hover:bg-surface-border rounded-md text-foreground/50 hover:text-foreground transition-colors"
                    title="Edit Workflow"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, workflow.id)}
                    disabled={deletingId === workflow.id}
                    className="p-1.5 hover:bg-red-500/10 rounded-md text-foreground/50 hover:text-red-500 transition-colors"
                    title="Delete Workflow"
                  >
                    {deletingId === workflow.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-foreground">{workflow.name}</h3>
                  <div className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${workflow.isActive ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-surface-border text-foreground/60'}`}>
                    {workflow.isActive ? 'ACTIVE' : 'DRAFT'}
                  </div>
                </div>
                <p className="text-sm text-muted line-clamp-2">{workflow.description || 'No description provided.'}</p>
              </div>

              {workflow.isActive && (
                <div className="pt-4 border-t border-surface-border mt-auto flex justify-end">
                  <button 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      setTriggerModalId(workflow.id); 
                      setTriggerPayload(workflow.testPayload || '{\n  \n}');
                    }}
                    disabled={triggeringId === workflow.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-sm font-medium transition-colors"
                  >
                    {triggeringId === workflow.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Run Now
                  </button>
                </div>
              )}
            </div>
          ))}

          <Link to="/workflows/new" className="glass-panel p-6 flex flex-col gap-4 border-dashed border-2 hover:border-solid hover:border-primary/50 transition-all cursor-pointer items-center justify-center text-center group">
            <div className="w-12 h-12 rounded-full bg-surface-border group-hover:bg-primary/10 group-hover:text-primary transition-colors flex items-center justify-center text-2xl font-light text-foreground/50">
              +
            </div>
            <span className="font-medium text-foreground/80 group-hover:text-foreground">Create New Workflow</span>
          </Link>
        </div>
      )}

      {activeLogsExecutionId && (
        <LiveLogsPanel 
          executionId={activeLogsExecutionId} 
          onClose={() => setActiveLogsExecutionId(null)} 
        />
      )}

      {historyWorkflowId && (
        <ExecutionHistoryModal 
          workflowId={historyWorkflowId}
          onClose={() => setHistoryWorkflowId(null)}
        />
      )}

      {/* Manual Trigger Modal */}
      {triggerModalId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-lg p-6 flex flex-col gap-4 animate-slide-up relative shadow-2xl">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-foreground">Manual Trigger</h2>
              <button onClick={() => setTriggerModalId(null)} className="text-foreground/50 hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Trigger Payload (JSON)</label>
              <textarea 
                value={triggerPayload}
                onChange={(e) => setTriggerPayload(e.target.value)}
                className="input-field min-h-[150px] font-mono text-sm"
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setTriggerModalId(null)} className="btn-secondary">Cancel</button>
              <button onClick={executeTrigger} disabled={!!triggeringId} className="btn-primary flex items-center gap-2">
                {triggeringId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Execute Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
