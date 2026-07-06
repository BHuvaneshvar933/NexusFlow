import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getWorkflowsApi, triggerWorkflowApi, deleteWorkflowApi } from '../services/workflow';
import { Activity, Loader2, Play, Pencil, Trash2, History } from 'lucide-react';
import { useState } from 'react';
import LiveLogsPanel from '../features/executions/LiveLogsPanel';
import ExecutionHistoryModal from '../features/executions/ExecutionHistoryModal';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ['workflows'],
    queryFn: getWorkflowsApi
  });
  
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeLogsWorkflowId, setActiveLogsWorkflowId] = useState<string | null>(null);
  const [historyWorkflowId, setHistoryWorkflowId] = useState<string | null>(null);

  const handleTrigger = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setTriggeringId(id);
    setActiveLogsWorkflowId(null); 
    try {
      await triggerWorkflowApi(id, { test: true });
      setActiveLogsWorkflowId(id); 
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
                    className="p-1.5 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors"
                    title="Execution History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => navigate(`/workflows/${workflow.id}/edit`)}
                    className="p-1.5 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors"
                    title="Edit Workflow"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, workflow.id)}
                    disabled={deletingId === workflow.id}
                    className="p-1.5 hover:bg-red-500/20 rounded-md text-white/40 hover:text-red-400 transition-colors"
                    title="Delete Workflow"
                  >
                    {deletingId === workflow.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-white">{workflow.name}</h3>
                  <div className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${workflow.isActive ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>
                    {workflow.isActive ? 'ACTIVE' : 'DRAFT'}
                  </div>
                </div>
                <p className="text-sm text-white/60 line-clamp-2">{workflow.description || 'No description provided.'}</p>
              </div>

              {workflow.isActive && (
                <div className="pt-4 border-t border-white/10 mt-auto flex justify-end">
                  <button 
                    onClick={(e) => handleTrigger(e, workflow.id)}
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
            <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors flex items-center justify-center text-2xl font-light text-white/50">
              +
            </div>
            <span className="font-medium text-white/80 group-hover:text-white">Create New Workflow</span>
          </Link>
        </div>
      )}

      {activeLogsWorkflowId && (
        <LiveLogsPanel 
          workflowId={activeLogsWorkflowId} 
          onClose={() => setActiveLogsWorkflowId(null)} 
        />
      )}

      {historyWorkflowId && (
        <ExecutionHistoryModal 
          workflowId={historyWorkflowId}
          onClose={() => setHistoryWorkflowId(null)}
        />
      )}
    </div>
  );
}
