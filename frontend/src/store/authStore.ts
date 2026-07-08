import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Workspace {
  id: string;
  name: string;
  role: string;
  joinedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  setAuth: (user: User, token: string) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspace: (id: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      workspaces: [],
      activeWorkspaceId: null,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      setWorkspaces: (workspaces) => set((state) => ({ 
        workspaces, 
        activeWorkspaceId: state.activeWorkspaceId || (workspaces.length > 0 ? workspaces[0].id : null) 
      })),
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
      logout: () => set({ user: null, token: null, isAuthenticated: false, workspaces: [], activeWorkspaceId: null }),
    }),
    {
      name: 'nexusflow-auth-storage', // name of item in localStorage
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        workspaces: state.workspaces,
        activeWorkspaceId: state.activeWorkspaceId,
        // Intentionally omitting 'token' so it is not saved to localStorage (XSS protection)
      }),
    }
  )
);
