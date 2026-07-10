import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Copy, AlertCircle } from 'lucide-react';
import { getSharedWorkflow, duplicateSharedWorkflow, type SharedWorkflow as ISharedWorkflow } from '../services/template';
import { useAuthStore } from '../store/authStore';
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import TriggerNode from '../features/workflows/components/nodes/TriggerNode';
import ActionNode from '../features/workflows/components/nodes/ActionNode';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

export default function SharedWorkflow() {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { activeWorkspaceId, token } = useAuthStore();
  
  const [workflow, setWorkflow] = useState<ISharedWorkflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [actionError, setActionError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (!shareId) return;
    
    setIsLoading(true);
    getSharedWorkflow(shareId)
      .then((data) => {
        setWorkflow(data);
        
        // Map to nodes
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        newNodes.push({
          id: 'trigger',
          type: 'trigger',
          position: { x: 0, y: 0 },
          data: { type: data.triggerType, readOnly: true },
        });

        data.actions.forEach((action, index) => {
          newNodes.push({
            id: action.id,
            type: 'action',
            position: { x: 0, y: (index + 1) * 150 },
            data: { action, readOnly: true }
          });

          const sourceId = index === 0 ? 'trigger' : data.actions[index - 1].id;
          newEdges.push({
            id: `e-${sourceId}-${action.id}`,
            source: sourceId,
            target: action.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#FF4F00', strokeWidth: 2 }
          });
        });

        setNodes(newNodes);
        setEdges(newEdges);
      })
      .catch((err) => {
        console.error(err);
        setError("This workflow does not exist or has been removed.");
      })
      .finally(() => setIsLoading(false));
  }, [shareId]);

  const handleDuplicate = async () => {
    setActionError(null);
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }
    if (!activeWorkspaceId) {
      setActionError("No active workspace selected. Please select a workspace from the dashboard.");
      return;
    }
    
    setIsDuplicating(true);
    try {
      const newWorkflow = await duplicateSharedWorkflow(shareId!, activeWorkspaceId);
      navigate(`/workflows/${newWorkflow.id}/edit`);
    } catch (err: any) {
      setActionError(err.message || 'Failed to duplicate workflow');
      setIsDuplicating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-foreground">Workflow Not Found</h2>
        <p className="text-foreground/70 mt-2">{error}</p>
        <button onClick={() => navigate('/')} className="mt-6 btn-primary py-2 px-4">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Read-Only Banner / Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex items-start justify-between pointer-events-none">
        <div className="bg-surface border border-surface-border p-4 rounded-2xl shadow-lg pointer-events-auto max-w-md">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
            {workflow.isTemplate ? 'Official Template' : 'Shared Workflow'}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{workflow.name}</h1>
          {workflow.description && (
            <p className="text-foreground/80 mt-1 text-sm leading-relaxed">
              {workflow.description}
            </p>
          )}
        </div>
        
        <div className="pointer-events-auto bg-surface p-2 rounded-xl border border-surface-border shadow-lg flex flex-col items-end gap-2">
          {actionError && (
            <div className="text-red-500 text-sm font-medium bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
              {actionError}
            </div>
          )}
          <button 
            onClick={handleDuplicate}
            disabled={isDuplicating}
            className="btn-primary py-2 px-6 shadow-[0_4px_14px_0_rgba(255,79,0,0.39)] hover:shadow-[0_6px_20px_rgba(255,79,0,0.23)] hover:bg-[#E64600] flex items-center gap-2"
          >
            {isDuplicating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Copy className="w-5 h-5" />}
            Duplicate to Workspace
          </button>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-surface-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative text-center">
            <h3 className="text-xl font-bold text-foreground mb-3">
              Log in to save this workflow
            </h3>
            <p className="text-foreground/70 text-sm mb-6">
              You need an account to duplicate and run this workflow in your own workspace.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate('/login')}
                className="btn-primary w-full py-2.5 text-base"
              >
                Log In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="btn-secondary w-full py-2.5 text-base"
              >
                Create an Account
              </button>
              <button 
                onClick={() => setShowLoginPrompt(false)}
                className="text-foreground/60 hover:text-foreground text-sm mt-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.5}
          maxZoom={2}
          className="bg-background"
        >
          <Background color="#9ca3af" variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-40" />
        </ReactFlow>
      </div>
    </div>
  );
}
