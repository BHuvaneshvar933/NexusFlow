import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Activity, LogOut, ChevronDown, Plus, Users, BookOpen, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import { getWorkspacesApi } from '../services/workspace';
import ThemeToggle from './ThemeToggle';

export default function Layout() {
  const { user, workspaces, activeWorkspaceId, setActiveWorkspace, setWorkspaces, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
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

  useEffect(() => {
    if (user && !activeWorkspaceId && location.pathname === '/') {
      navigate('/workspaces');
    }
  }, [user, activeWorkspaceId, location.pathname, navigate]);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const isWorkspacesHub = location.pathname === '/workspaces';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-panel rounded-none border-t-0 border-x-0 border-b border-surface-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo - Click to go home */}
            <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity cursor-pointer">
              <Activity className="w-6 h-6" />
              <span className="font-bold text-xl tracking-tight text-foreground hidden sm:block">NexusFlow</span>
            </Link>

            {/* Workspace Switcher */}
            {activeWorkspace && !isWorkspacesHub && (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-border border border-surface-border transition-colors"
                >
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {activeWorkspace.name.substring(0, 1)}
                  </div>
                  <span className="text-sm font-medium text-foreground max-w-[120px] truncate">{activeWorkspace.name}</span>
                  <ChevronDown className="w-4 h-4 text-foreground/50" />
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-64 glass-panel border border-surface-border shadow-2xl rounded-xl overflow-hidden z-50 py-2">
                      <div className="px-3 py-2 text-xs font-semibold text-foreground/40 uppercase tracking-wider">Your Workspaces</div>
                      
                      {workspaces.map(w => (
                        <button
                          key={w.id}
                          onClick={() => { setActiveWorkspace(w.id); setIsDropdownOpen(false); window.location.href = '/'; }}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-surface-border transition-colors ${w.id === activeWorkspaceId ? 'bg-primary/10 text-primary' : 'text-foreground/80'}`}
                        >
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white uppercase ${w.id === activeWorkspaceId ? 'bg-primary' : 'bg-foreground/20 text-foreground'}`}>
                            {w.name.substring(0, 1)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{w.name}</span>
                            <span className="text-[10px] opacity-70">{w.role}</span>
                          </div>
                        </button>
                      ))}

                      <div className="border-t border-surface-border mt-2 pt-2">
                        <button 
                          onClick={() => { setIsDropdownOpen(false); navigate('/settings/workspace'); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-surface-border transition-colors"
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
            {/* Top Navigation Links */}
            {!isWorkspacesHub && (
              <div className="hidden md:flex items-center gap-1 bg-surface-border/50 p-1 rounded-lg">
                <Link 
                  to="/" 
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${location.pathname === '/' ? 'bg-surface text-foreground shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
                >
                  Workflows
                </Link>
                <Link 
                  to="/executions" 
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${location.pathname === '/executions' ? 'bg-surface text-foreground shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
                >
                  Executions
                </Link>
                <Link 
                  to="/help" 
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${location.pathname === '/help' ? 'bg-surface text-foreground shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
                >
                  Help
                </Link>
              </div>
            )}

            {!isWorkspacesHub && <div className="w-px h-6 bg-surface-border mx-1 hidden md:block" />}

            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-2">
                <Link 
                  to="/settings/profile"
                  className="flex items-center gap-2 p-1.5 px-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-surface-border rounded-lg transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-foreground/50 hover:text-foreground hover:bg-surface-border rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
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
