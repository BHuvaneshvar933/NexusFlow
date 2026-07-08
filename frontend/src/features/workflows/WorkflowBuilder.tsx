import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, Save, Loader2, Maximize } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { createWorkflowApi, getWorkflowApi, updateWorkflowApi } from '../../services/workflow';

import { ReactFlow, Controls, Background, useNodesState, useEdgesState, BackgroundVariant } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import TriggerNode from './components/nodes/TriggerNode';
import ActionNode from './components/nodes/ActionNode';
import ActionPicker from './components/ActionPicker';
import ActionConfigSidebar from './components/ActionConfigSidebar';
import TriggerConfigSidebar from './components/TriggerConfigSidebar';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

export default function WorkflowBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { name, description, triggerType, cronExpression, actions, setName, loadWorkflow, reset, removeAction } = useWorkflowStore();
  
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Load workflow data
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getWorkflowApi(id)
        .then((response) => {
          loadWorkflow(response.data);
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

  // Sync React Flow nodes and edges with our global Zustand store (Linear Mapping)
  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // 1. Trigger Node
    newNodes.push({
      id: 'trigger',
      type: 'trigger',
      position: { x: 0, y: 0 },
      data: { 
        type: triggerType, 
        cronExpression,
        onClick: () => setSelectedNodeId('trigger') 
      },
    });

    // 2. Action Nodes
    actions.forEach((action, index) => {
      const isLast = index === actions.length - 1;
      const nodeId = action.id;
      
      newNodes.push({
        id: nodeId,
        type: 'action',
        position: { x: 0, y: (index + 1) * 150 },
        data: { 
          action,
          isLast,
          onClick: () => setSelectedNodeId(nodeId),
          onAddNext: () => setIsPickerOpen(true),
          onDelete: () => removeAction(action.id)
        }
      });

      // Edge from previous node
      const sourceId = index === 0 ? 'trigger' : actions[index - 1].id;
      newEdges.push({
        id: `e-${sourceId}-${nodeId}`,
        source: sourceId,
        target: nodeId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 }
      });
    });

    // If no actions exist, still allow adding one from the trigger
    if (actions.length === 0) {
      newNodes[0].data.onAddNext = () => setIsPickerOpen(true);
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [actions, triggerType, cronExpression, setNodes, setEdges, removeAction]);

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
        actions: actions.map((a, i) => ({
          actionType: a.actionType,
          sequence: i + 1, // Enforce sequence for backend
          config: a.config
        }))
      };
      
      if (id) {
        await updateWorkflowApi(id, payload);
      } else {
        await createWorkflowApi(payload);
      }
      navigate('/');
    } catch (error: any) {
      alert(error.message || "Failed to save workflow");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
      
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex items-start justify-between pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <button 
            onClick={() => navigate('/')}
            className="text-white/40 hover:text-white transition-colors w-fit text-sm font-medium flex items-center gap-1 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10"
          >
            ← Dashboard
          </button>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-3xl font-bold bg-transparent border-none outline-none focus:ring-0 text-white placeholder-white/30 drop-shadow-md"
            placeholder="Workflow Name"
          />
        </div>
        
        <div className="flex items-center gap-3 pointer-events-auto bg-black/50 p-2 rounded-xl backdrop-blur-md border border-white/10 shadow-2xl">
          <button 
            onClick={() => setIsPickerOpen(true)}
            className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2"
          >
            Add Action
          </button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button 
            onClick={() => handleSave(false)} 
            disabled={isSaving}
            className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          <button 
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          >
            <Play className="w-4 h-4" /> Deploy
          </button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          nodesConnectable={false}
          elementsSelectable={true}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.5}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          className="bg-[#050505]"
        >
          <Background color="#ffffff" variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-10" />
          <Controls className="bg-black/50 border border-white/10 fill-white rounded-lg overflow-hidden backdrop-blur-md" showInteractive={false} />
        </ReactFlow>
      </div>

      {/* Slide-out Action Picker */}
      {isPickerOpen && (
        <ActionPicker onClose={() => setIsPickerOpen(false)} />
      )}

      {/* Slide-out Config Sidebars */}
      {selectedNodeId === 'trigger' && (
        <TriggerConfigSidebar onClose={() => setSelectedNodeId(null)} />
      )}
      
      {selectedNodeId && selectedNodeId !== 'trigger' && (
        <ActionConfigSidebar 
          actionId={selectedNodeId} 
          onClose={() => setSelectedNodeId(null)} 
        />
      )}
    </div>
  );
}
