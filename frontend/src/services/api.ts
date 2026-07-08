import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://localhost:3000/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token;
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const activeWorkspaceId = useAuthStore.getState().activeWorkspaceId;
  if (activeWorkspaceId) {
    headers.set('x-workspace-id', activeWorkspaceId);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include' // crucial for sending HTTP-Only cookies
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // Auto logout on unauthorized
      useAuthStore.getState().logout();
    }
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};
