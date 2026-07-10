import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, Loader2, Sparkles, Copy } from 'lucide-react';
import { getTemplates, duplicateSharedWorkflow, type SharedWorkflow } from '../services/template';
import { useAuthStore } from '../store/authStore';

export default function Templates() {
  const [templates, setTemplates] = useState<SharedWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { activeWorkspaceId } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    getTemplates()
      .then(setTemplates)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleDuplicate = async (shareId: string) => {
    setError(null);
    if (!activeWorkspaceId) {
      setError("No active workspace selected. Please select a workspace first.");
      return;
    }
    
    setIsDuplicating(shareId);
    try {
      const newWorkflow = await duplicateSharedWorkflow(shareId, activeWorkspaceId);
      navigate(`/workflows/${newWorkflow.id}/edit`);
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate template');
      setIsDuplicating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up pb-12">
      <div className="bg-surface border border-surface-border p-8 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3 relative z-10">
          <Library className="w-8 h-8 text-primary" />
          Template Library
        </h1>
        <p className="text-muted mt-2 text-lg relative z-10 max-w-2xl">
          Jumpstart your automation with official, pre-built NexusFlow templates.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center justify-between">
          <span className="font-medium text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500/80 hover:text-red-500">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(tpl => (
          <div key={tpl.id} className="bg-surface border border-surface-border rounded-xl p-6 flex flex-col hover:border-primary/50 transition-colors shadow-sm group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-background rounded-xl border border-surface-border group-hover:bg-primary/10 transition-colors">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-foreground mb-2">{tpl.name}</h3>
            <p className="text-foreground/70 text-sm mb-6 flex-1">{tpl.description}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-border">
              <div className="text-xs text-foreground/50">{tpl.actions.length} Actions</div>
              <button
                onClick={() => handleDuplicate(tpl.shareId)}
                disabled={isDuplicating === tpl.shareId}
                className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2"
              >
                {isDuplicating === tpl.shareId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                Use Template
              </button>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-surface-border rounded-xl">
            <Sparkles className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No Templates Available</h3>
            <p className="text-foreground/60 mt-1">Check back later for new official templates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
