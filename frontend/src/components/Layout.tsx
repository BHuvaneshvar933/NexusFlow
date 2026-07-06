import { Outlet, useNavigate } from 'react-router-dom';
import { Activity, LogOut, ChevronDown, Plus, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import { getWorkspacesApi } from '../services/workspace';

export default function Layout() {
  const { user, workspaces, activeWorkspaceId, setActiveWorkspace, setWorkspaces, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      getWorkspacesApi()
        .then(res => setWorkspaces(res.data))
        .catch(console.error);
    }
  }, [user, setWorkspaces]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-panel rounded-none border-t-0 border-x-0 border-b border-surface-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-primary">
              <Activity className="w-6 h-6" />
              <span className="font-bold text-xl tracking-tight text-white hidden sm:block">NexusFlow</span>
            </div>

            {/* Workspace Switcher */}
            {activeWorkspace && (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {activeWorkspace.name.substring(0, 1)}
                  </div>
                  <span className="text-sm font-medium text-white max-w-[120px] truncate">{activeWorkspace.name}</span>
                  <ChevronDown className="w-4 h-4 text-white/50" />
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-64 glass-panel border border-surface-border shadow-2xl rounded-xl overflow-hidden z-50 py-2">
                      <div className="px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Your Workspaces</div>
                      
                      {workspaces.map(w => (
                        <button
                          key={w.id}
                          onClick={() => { setActiveWorkspace(w.id); setIsDropdownOpen(false); window.location.reload(); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/5 transition-colors ${w.id === activeWorkspaceId ? 'bg-primary/10 text-primary' : 'text-white/80'}`}
                        >
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white uppercase ${w.id === activeWorkspaceId ? 'bg-primary' : 'bg-white/20'}`}>
                            {w.name.substring(0, 1)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{w.name}</span>
                            <span className="text-[10px] opacity-70">{w.role}</span>
                          </div>
                        </button>
                      ))}

                      <div className="border-t border-white/10 mt-2 pt-2">
                        <button 
                          onClick={() => { setIsDropdownOpen(false); navigate('/settings/workspace'); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Users className="w-4 h-4" /> Workspace Settings
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <nav className="flex items-center gap-4">
            {user && (
              <>
                <div className="text-sm font-medium text-foreground/80">{user.name}</div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-foreground/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
