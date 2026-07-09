import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Plus, LayoutGrid, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getWorkspacesApi, createWorkspaceApi } from '../services/workspace';

export default function Workspaces() {
  const navigate = useNavigate();
  const { workspaces, setActiveWorkspace, setWorkspaces, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setIsLoading(true);
      const res = await getWorkspacesApi();
      setWorkspaces(res.data);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectWorkspace = (id: string) => {
    setActiveWorkspace(id);
    navigate('/');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    
    setIsCreating(true);
    try {
      const res = await createWorkspaceApi({ name: newWorkspaceName });
      await loadWorkspaces();
      setNewWorkspaceName('');
      // Auto select the new workspace
      handleSelectWorkspace(res.data.id);
    } catch (error: any) {
      alert(error.message || 'Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  // Generate a distinct gradient for a given workspace name (basic deterministic logic)
  const getGradient = (name: string) => {
    const charCode = name.charCodeAt(0) || 0;
    const gradients = [
      'from-blue-500 to-purple-500',
      'from-emerald-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-cyan-500',
      'from-violet-500 to-fuchsia-500'
    ];
    return gradients[charCode % gradients.length];
  };

  if (isLoading && workspaces.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-slide-up py-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Welcome to NexusFlow{user ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          Select a workspace to start building workflows, or create a new one to organize your projects.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Existing Workspaces */}
        {workspaces.map((workspace) => (
          <button
            key={workspace.id}
            onClick={() => handleSelectWorkspace(workspace.id)}
            className="glass-panel p-6 text-left hover:border-primary/50 hover:shadow-lg transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradient(workspace.name)} flex items-center justify-center text-white text-xl font-bold shadow-sm`}>
                {workspace.name.substring(0, 1).toUpperCase()}
              </div>
              <div className="px-3 py-1 rounded-full bg-surface-border text-xs font-medium text-foreground/70 uppercase tracking-wider">
                {workspace.role}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{workspace.name}</h3>
            
            <div className="flex items-center gap-2 text-sm text-muted mt-4">
              <LayoutGrid className="w-4 h-4" />
              <span>Enter Workspace</span>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}

        {/* Create Workspace Card */}
        <div className="glass-panel p-6 border-dashed border-2 hover:border-primary/50 transition-colors flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">New Workspace</h3>
          </div>
          
          <form onSubmit={handleCreate} className="space-y-3 mt-auto">
            <input 
              type="text" 
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="e.g. Marketing Team"
              className="input-field bg-background border-surface-border focus:bg-surface"
              required
            />
            <button 
              type="submit"
              disabled={isCreating || !newWorkspaceName.trim()}
              className="w-full btn-primary py-2 flex justify-center"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
