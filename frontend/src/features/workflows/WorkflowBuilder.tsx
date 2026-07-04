import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Save, Loader2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import ActionNode from './components/ActionNode';
import ActionPicker from './components/ActionPicker';
import ActionConfigSidebar from './components/ActionConfigSidebar';
import { createWorkflowApi } from '../../services/workflow';

export default function WorkflowBuilder() {
  const navigate = useNavigate();
  const { name, description, triggerType, actions, setName } = useWorkflowStore();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

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
        isActive,
        actions: actions.map(a => ({
          actionType: a.actionType,
          config: a.config
        }))
      };
      
      await createWorkflowApi(payload);
      // Navigate back to dashboard on success
      navigate('/');
    } catch (error: any) {
      alert(error.message || "Failed to save workflow");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-12 animate-fade-in">
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

      {/* Canvas */}
      <div className="relative flex flex-col items-center">
        
        {/* Trigger Node (Fixed at top) */}
        <div className="glass-panel w-full max-w-xl p-6 border-dashed border-2 border-primary/50 text-center animate-slide-up">
          <h3 className="text-lg font-semibold text-white">Trigger</h3>
          <p className="text-white/60 text-sm mt-1">Manual Execution (API Trigger)</p>
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
