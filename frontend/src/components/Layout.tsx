import { Outlet, useNavigate } from 'react-router-dom';
import { Activity, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-panel rounded-none border-t-0 border-x-0 border-b border-surface-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight text-white">NexusFlow</span>
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
