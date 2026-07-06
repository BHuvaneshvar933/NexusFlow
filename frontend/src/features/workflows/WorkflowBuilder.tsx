import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, Plus, Save, Loader2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import ActionNode from './components/ActionNode';
import ActionPicker from './components/ActionPicker';
import ActionConfigSidebar from './components/ActionConfigSidebar';
import { createWorkflowApi, getWorkflowApi, updateWorkflowApi } from '../../services/workflow';

export default function WorkflowBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { name, description, triggerType, cronExpression, actions, setName, setTriggerType, setCronExpression, loadWorkflow, reset } = useWorkflowStore();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getWorkflowApi(id)
        .then((data) => {
          loadWorkflow(data);
        })
        .catch((err) => {
          console.error(err);
          alert('Failed to load workflow');
          navigate('/');
        })
        .finally(() => setIsLoading(false));
    } else {
      reset();
    }
  }, [id, loadWorkflow, reset, navigate]);

  const handleSave = async (isActive: boolean = false) => {
    if (actions.length === 0) {
      alert("Please add at least one action to the workflow.");
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        name,
        description,
        triggerType,
        cronExpression,
        isActive,
        actions: actions.map(a => ({
          actionType: a.actionType,
          config: a.config
        }))
      };
      
      if (id) {
        await updateWorkflowApi(id, payload);
      } else {
        await createWorkflowApi(payload);
      }
      // Navigate back to dashboard on success
      navigate('/');
    } catch (error: any) {
      alert(error.message || "Failed to save workflow");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      
      {/* Header */}
      <div className="flex flex-col gap-4 mb-12 animate-fade-in">
        <button 
          onClick={() => navigate('/')}
          className="text-white/40 hover:text-white transition-colors w-fit text-sm font-medium flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-3xl font-bold bg-transparent border-none outline-none focus:ring-0 text-white placeholder-white/30"
            placeholder="Workflow Name"
          />
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleSave(false)} 
              disabled={isSaving}
              className="btn-secondary flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Draft
            </button>
            <button 
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Deploy
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex flex-col items-center">
        
        {/* Trigger Node (Fixed at top) */}
        <div className="glass-panel w-full max-w-xl p-6 border-dashed border-2 border-primary/50 animate-slide-up flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Trigger</h3>
              <p className="text-white/60 text-sm mt-1">How should this workflow start?</p>
            </div>
            <select 
              value={triggerType} 
              onChange={(e) => setTriggerType(e.target.value)}
              className="input-field max-w-[150px] py-1.5"
            >
              <option value="WEBHOOK">Webhook API</option>
              <option value="CRON">Scheduled (Cron)</option>
            </select>
          </div>

          {triggerType === 'WEBHOOK' || triggerType === 'MANUAL' ? (
            <div className="flex flex-col items-center text-center">
              {id ? (
                <div className="w-full bg-black/40 border border-white/10 rounded-md p-3 flex flex-col items-start gap-1">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Webhook URL</span>
                  <code className="text-xs text-primary font-mono select-all w-full text-left overflow-x-auto">
                    {`${window.location.protocol}//${window.location.hostname}:3000/api/webhooks/${id}`}
                  </code>
                </div>
              ) : (
                <p className="text-xs text-orange-400/80 italic">Save this workflow to generate its unique Webhook URL.</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
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

        {/* Vertical Connecting Line */}
        {actions.length > 0 && (
          <div className="w-1 bg-white/10 h-8 my-1" />
        )}

        {/* Action Nodes */}
        <div className="flex flex-col items-center w-full relative">
          {/* Background vertical line spanning all actions */}
          {actions.length > 0 && (
            <div className="absolute top-0 bottom-0 left-1/2 -ml-0.5 w-1 bg-white/10 -z-10" />
          )}

          {actions.map((action, index) => (
            <div key={action.id} className="w-full flex flex-col items-center">
              <ActionNode 
                action={action} 
                index={index} 
                isSelected={selectedActionId === action.id}
                onSelect={() => setSelectedActionId(action.id)}
              />
              <div className="w-1 bg-white/10 h-8 my-1" />
            </div>
          ))}
        </div>

        {/* Add Step Button */}
        <button 
          onClick={() => setIsPickerOpen(true)}
          className="relative z-10 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 shadow-xl mt-2 animate-fade-in"
        >
          <Plus className="w-6 h-6" />
        </button>

      </div>

      {/* Slide-out Action Picker */}
      {isPickerOpen && (
        <ActionPicker onClose={() => setIsPickerOpen(false)} />
      )}

      {/* Slide-out Action Config Sidebar */}
      {selectedActionId && (
        <ActionConfigSidebar 
          actionId={selectedActionId} 
          onClose={() => setSelectedActionId(null)} 
        />
      )}

    </div>
  );
}
