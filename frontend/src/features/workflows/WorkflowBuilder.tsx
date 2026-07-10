import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, Save, Loader2, Share2, Copy, Check } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { createWorkflowApi, getWorkflowApi, updateWorkflowApi } from '../../services/workflow';
import { shareWorkflow } from '../../services/template';
import { useAuthStore } from '../../store/authStore';

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
  
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeWorkspaceId } = useAuthStore();
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

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
          setError('Failed to load workflow');
          setTimeout(() => navigate('/'), 2000);
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
        style: { stroke: '#FF4F00', strokeWidth: 2 }
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
    setError(null);
    if (actions.length === 0) {
      setError("Please add at least one action to the workflow.");
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
    } catch (err: any) {
      setError(err.message || "Failed to save workflow");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    setError(null);
    if (!id) {
      setError("Please save the workflow first before sharing.");
      return;
    }
    setIsSharing(true);
    try {
      const res = await shareWorkflow(id, activeWorkspaceId!);
      setShareLink(`${window.location.origin}/shared/${res.shareId}`);
    } catch(e: any) {
      setError(e.message || "Failed to share workflow");
    } finally {
      setIsSharing(false);
    }
  };

  const copyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex flex-col gap-4 pointer-events-none">
        
        {/* Top Navbar items */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button 
              onClick={() => navigate('/')}
              className="text-foreground/70 hover:text-foreground transition-colors w-fit text-sm font-medium flex items-center gap-1 bg-surface px-3 py-1.5 rounded-full border border-surface-border shadow-sm"
            >
              ← Dashboard
            </button>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-3xl font-bold bg-transparent border-none outline-none focus:ring-0 text-foreground placeholder-foreground/50 drop-shadow-sm"
              placeholder="Workflow Name"
            />
          </div>
          
          <div className="flex items-center gap-3 pointer-events-auto bg-surface p-2 rounded-xl border border-surface-border shadow-sm">
            <button 
              onClick={() => setIsPickerOpen(true)}
              className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2"
            >
              Add Action
            </button>
            <div className="w-px h-6 bg-surface-border mx-1" />
            {id && (
              <button 
                onClick={handleShare} 
                disabled={isSharing}
                className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2"
              >
                {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                Share
              </button>
            )}
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
              className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2 shadow-[0_4px_14px_0_rgba(255,79,0,0.39)] hover:shadow-[0_6px_20px_rgba(255,79,0,0.23)] hover:bg-[#E64600]"
            >
              <Play className="w-4 h-4" /> Deploy
            </button>
          </div>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="pointer-events-auto bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl flex items-center justify-between w-fit mx-auto shadow-md backdrop-blur-md">
            <span className="font-medium text-sm mr-4">{error}</span>
            <button onClick={() => setError(null)} className="text-red-500/80 hover:text-red-500">
              ✕
            </button>
          </div>
        )}
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
          className="bg-background"
        >
          <Background color="#9ca3af" variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-40" />
          <Controls className="bg-surface border border-surface-border fill-foreground rounded-lg overflow-hidden shadow-sm" showInteractive={false} />
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

      {/* Share Modal */}
      {shareLink && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Workflow Shared!
            </h3>
            <p className="text-foreground/70 text-sm mb-4">
              Anyone with this link can view a preview and duplicate this workflow into their workspace.
            </p>
            <div className="flex items-center gap-2 mb-6">
              <input 
                type="text"
                readOnly
                value={shareLink}
                className="input flex-1 text-sm bg-surface"
              />
              <button 
                onClick={copyLink}
                className="btn-secondary p-2.5"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShareLink(null)} className="btn-primary py-2 px-4">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
