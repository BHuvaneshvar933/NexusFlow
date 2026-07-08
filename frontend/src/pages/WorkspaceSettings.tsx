import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { inviteMemberApi } from '../services/workspace';
import { Users, Loader2 } from 'lucide-react';

export default function WorkspaceSettings() {
  const { workspaces, activeWorkspaceId } = useAuthStore();
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [isInviting, setIsInviting] = useState(false);

  if (!activeWorkspace) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      await inviteMemberApi({ email: inviteEmail, newRole: inviteRole });
      alert('Member invited successfully!');
      setInviteEmail('');
    } catch (error: any) {
      alert(error.message || 'Failed to invite member');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workspace Settings</h1>
        <p className="text-foreground/70 mt-2">Manage your current workspace and invite collaborators.</p>
      </div>

      <div className="max-w-xl">
        {/* Invite Section */}
        <div className="glass-panel p-6 border-surface-border">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Invite Members</h2>
          </div>
          
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Email Address</label>
              <input 
                type="email" 
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="input-field"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Role</label>
              <select 
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="input-field"
              >
                <option value="editor">Editor (Can edit workflows)</option>
                <option value="viewer">Viewer (Can only view)</option>
                <option value="admin">Admin (Can manage settings)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isInviting || activeWorkspace.role === 'viewer' || activeWorkspace.role === 'editor'}
              className="btn-primary w-full justify-center"
            >
              {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invite'}
            </button>
            {(activeWorkspace.role === 'viewer' || activeWorkspace.role === 'editor') && (
              <p className="text-xs text-orange-400 mt-2 text-center">Only Owners or Admins can invite members.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
