import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  updateWorkspaceApi, 
  deleteWorkspaceApi, 
  getMembersApi, 
  inviteMemberApi, 
  removeMemberApi, 
  updateMemberRoleApi 
} from '../services/workspace';
import { getSecretsApi, createSecretApi, deleteSecretApi } from '../services/secret';
import { Users, Settings, KeyRound, Loader2, Trash2, Plus, Copy, Check } from 'lucide-react';

export default function WorkspaceSettings() {
  const navigate = useNavigate();
  const { workspaces, activeWorkspaceId, setWorkspaces } = useAuthStore();
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const isPrivileged = activeWorkspace?.role === 'owner' || activeWorkspace?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'secrets'>('general');
  const [isLoading, setIsLoading] = useState(false);

  // General State
  const [workspaceName, setWorkspaceName] = useState(activeWorkspace?.name || '');
  
  // Members State
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');

  // Secrets State
  const [secrets, setSecrets] = useState<any[]>([]);
  const [newSecretName, setNewSecretName] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');
  const [newSecretDesc, setNewSecretDesc] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (activeWorkspace) {
      setWorkspaceName(activeWorkspace.name);
      loadMembers();
      loadSecrets();
    }
  }, [activeWorkspaceId]);

  const loadMembers = async () => {
    if (!activeWorkspaceId) return;
    try {
      const res = await getMembersApi(activeWorkspaceId);
      setMembers(res.data);
    } catch (error) {
      console.error('Failed to load members', error);
    }
  };

  const loadSecrets = async () => {
    if (!activeWorkspaceId) return;
    try {
      const res = await getSecretsApi(activeWorkspaceId);
      setSecrets(res.data);
    } catch (error) {
      console.error('Failed to load secrets', error);
    }
  };

  if (!activeWorkspace) return null;

  // --- General Actions ---
  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPrivileged) return;
    setIsLoading(true);
    try {
      const res = await updateWorkspaceApi(activeWorkspace.id, { name: workspaceName });
      setWorkspaces(workspaces.map(w => w.id === activeWorkspace.id ? { ...w, name: res.data.name } : w));
      alert('Workspace updated successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to update workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (activeWorkspace.role !== 'owner') return;
    if (!confirm('Are you absolutely sure you want to delete this workspace? This will permanently delete all workflows, executions, data stores, and secrets. This action cannot be undone.')) return;
    
    setIsLoading(true);
    try {
      await deleteWorkspaceApi(activeWorkspace.id);
      window.location.href = '/workspaces'; // Force reload to clear state
    } catch (error: any) {
      alert(error.message || 'Failed to delete workspace');
      setIsLoading(false);
    }
  };

  // --- Member Actions ---
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await inviteMemberApi(activeWorkspace.id, { email: inviteEmail, role: inviteRole });
      await loadMembers();
      setInviteEmail('');
    } catch (error: any) {
      alert(error.message || 'Failed to invite member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      await removeMemberApi(activeWorkspace.id, userId);
      await loadMembers();
    } catch (error: any) {
      alert(error.message || 'Failed to remove member');
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await updateMemberRoleApi(activeWorkspace.id, userId, { role });
      await loadMembers();
    } catch (error: any) {
      alert(error.message || 'Failed to update role');
    }
  };

  // --- Secret Actions ---
  const handleCreateSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createSecretApi(activeWorkspace.id, { 
        name: newSecretName, 
        value: newSecretValue, 
        description: newSecretDesc 
      });
      await loadSecrets();
      setNewSecretName('');
      setNewSecretValue('');
      setNewSecretDesc('');
    } catch (error: any) {
      alert(error.message || 'Failed to create secret');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSecret = async (name: string) => {
    if (!confirm(`Delete secret ${name}? Workflows using this secret will fail.`)) return;
    try {
      await deleteSecretApi(activeWorkspace.id, name);
      await loadSecrets();
    } catch (error: any) {
      alert(error.message || 'Failed to delete secret');
    }
  };

  const handleCopySyntax = (name: string) => {
    navigator.clipboard.writeText(`{{secrets.${name}}}`);
    setCopiedId(name);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Workspace Settings</h1>
        <p className="text-foreground/70 mt-2">Manage workspace preferences, members, and secure credentials.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'general' 
                ? 'bg-surface border-primary/50 text-foreground shadow-sm' 
                : 'bg-transparent border-transparent hover:bg-surface-border text-foreground/70 hover:text-foreground'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">General</span>
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'members' 
                ? 'bg-surface border-primary/50 text-foreground shadow-sm' 
                : 'bg-transparent border-transparent hover:bg-surface-border text-foreground/70 hover:text-foreground'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Members</span>
          </button>
          <button
            onClick={() => setActiveTab('secrets')}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              activeTab === 'secrets' 
                ? 'bg-surface border-primary/50 text-foreground shadow-sm' 
                : 'bg-transparent border-transparent hover:bg-surface-border text-foreground/70 hover:text-foreground'
            }`}
          >
            <KeyRound className="w-5 h-5" />
            <span className="font-medium">Secrets Vault</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6 min-h-[500px]">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="animate-fade-in space-y-8">
              <div className="glass-panel p-6 border-surface-border">
                <h2 className="text-xl font-semibold text-foreground mb-4">Workspace Info</h2>
                <form onSubmit={handleUpdateWorkspace} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Workspace Name</label>
                    <input 
                      type="text" 
                      required
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      disabled={!isPrivileged}
                      className="input-field"
                    />
                  </div>
                  {isPrivileged && (
                    <button type="submit" disabled={isLoading} className="btn-primary">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                    </button>
                  )}
                </form>
              </div>

              {activeWorkspace.role === 'owner' && (
                <div className="glass-panel p-6 border-red-500/30 bg-red-500/5">
                  <h2 className="text-xl font-semibold text-red-500 mb-2">Danger Zone</h2>
                  <p className="text-sm text-foreground/70 mb-4 leading-relaxed">
                    Permanently delete this workspace and all of its workflows, execution logs, data stores, and secrets. This action is irreversible.
                  </p>
                  <button 
                    onClick={handleDeleteWorkspace}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-lg font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 transition-colors border border-red-500/20"
                  >
                    Delete Workspace
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MEMBERS TAB */}
          {activeTab === 'members' && (
            <div className="animate-fade-in space-y-8">
              {isPrivileged && (
                <div className="glass-panel p-6 border-surface-border">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Invite Member</h2>
                  <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                    <input 
                      type="email" 
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Email address"
                      className="input-field flex-1"
                    />
                    <select 
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="input-field w-full sm:w-40"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button type="submit" disabled={isLoading} className="btn-primary whitespace-nowrap">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invite'}
                    </button>
                  </form>
                </div>
              )}

              <div className="glass-panel overflow-hidden border-surface-border">
                <div className="p-6 border-b border-surface-border bg-surface/50">
                  <h2 className="text-xl font-semibold text-foreground">Workspace Members</h2>
                </div>
                <div className="divide-y divide-surface-border">
                  {members.map(member => (
                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-surface/30 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{member.user.name}</span>
                        <span className="text-sm text-foreground/60">{member.user.email}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 rounded-full bg-surface text-xs font-medium uppercase tracking-wider text-foreground/70 border border-surface-border">
                          {member.role}
                        </span>
                        
                        {isPrivileged && member.role !== 'owner' && (
                          <div className="flex items-center gap-2">
                            <select 
                              value={member.role}
                              onChange={(e) => handleUpdateRole(member.user.id, e.target.value)}
                              className="text-xs bg-surface border border-surface-border rounded p-1 text-foreground"
                            >
                              <option value="admin">Admin</option>
                              <option value="editor">Editor</option>
                              <option value="viewer">Viewer</option>
                            </select>
                            <button 
                              onClick={() => handleRemoveMember(member.user.id)}
                              className="p-1.5 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                              title="Remove Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECRETS TAB */}
          {activeTab === 'secrets' && (
            <div className="animate-fade-in space-y-8">
              
              <div className="glass-panel p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">Secrets Vault</h2>
                    <p className="text-sm text-foreground/70 leading-relaxed max-w-2xl">
                      Store sensitive information like API keys securely. Secrets are encrypted at rest and injected directly into your workflow executions. They are never exposed in the UI after creation.
                    </p>
                  </div>
                </div>
              </div>

              {isPrivileged && (
                <form onSubmit={handleCreateSecret} className="glass-panel p-6 border-surface-border space-y-4">
                  <h3 className="font-semibold text-foreground">Add New Secret</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground/70 uppercase">Name (e.g. STRIPE_KEY)</label>
                      <input 
                        type="text" 
                        required
                        value={newSecretName}
                        onChange={(e) => setNewSecretName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                        placeholder="OPENAI_API_KEY"
                        className="input-field font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground/70 uppercase">Value</label>
                      <input 
                        type="password" 
                        required
                        value={newSecretValue}
                        onChange={(e) => setNewSecretValue(e.target.value)}
                        placeholder="sk-..."
                        className="input-field font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-medium text-foreground/70 uppercase">Description (Optional)</label>
                      <input 
                        type="text" 
                        value={newSecretDesc}
                        onChange={(e) => setNewSecretDesc(e.target.value)}
                        placeholder="Production API Key for OpenAI"
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="btn-primary mt-2 flex items-center gap-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Secret
                  </button>
                </form>
              )}

              <div className="glass-panel overflow-hidden border-surface-border">
                <div className="p-6 border-b border-surface-border bg-surface/50">
                  <h3 className="font-semibold text-foreground">Stored Secrets</h3>
                </div>
                {secrets.length === 0 ? (
                  <div className="p-8 text-center text-foreground/50">
                    No secrets stored in this workspace yet.
                  </div>
                ) : (
                  <div className="divide-y divide-surface-border">
                    {secrets.map(secret => (
                      <div key={secret.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-surface/30 transition-colors gap-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                              {secret.name}
                            </span>
                            <span className="text-xs text-foreground/50">
                              Updated {new Date(secret.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          {secret.description && (
                            <span className="text-sm text-foreground/70 mt-1">{secret.description}</span>
                          )}
                          <span className="text-xs font-mono text-foreground/40 mt-1">
                            value: ••••••••••••••••••••
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <button 
                            onClick={() => handleCopySyntax(secret.name)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-surface border border-surface-border hover:bg-surface-border rounded-lg transition-colors text-foreground/80"
                            title="Copy variable syntax"
                          >
                            {copiedId === secret.name ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedId === secret.name ? 'Copied' : 'Copy Variable'}
                          </button>
                          
                          {isPrivileged && (
                            <button 
                              onClick={() => handleDeleteSecret(secret.name)}
                              className="p-1.5 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                              title="Delete Secret"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
