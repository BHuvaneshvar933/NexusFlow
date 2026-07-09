import { apiFetch } from './api';

export const getWorkspacesApi = () => {
  return apiFetch('/workspaces', { method: 'GET' });
};

export const createWorkspaceApi = (data: { name: string }) => {
  return apiFetch('/workspaces', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const inviteMemberApi = (workspaceId: string, data: { email: string; role?: string }) => {
  return apiFetch(`/workspaces/${workspaceId}/members`, {
    method: 'POST',
    body: JSON.stringify({ ...data, newRole: data.role }), // Backend expects newRole
  });
};

export const updateWorkspaceApi = (workspaceId: string, data: { name: string }) => {
  return apiFetch(`/workspaces/${workspaceId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteWorkspaceApi = (workspaceId: string) => {
  return apiFetch(`/workspaces/${workspaceId}`, {
    method: 'DELETE',
  });
};

export const getMembersApi = (workspaceId: string) => {
  return apiFetch(`/workspaces/${workspaceId}/members`, { method: 'GET' });
};

export const removeMemberApi = (workspaceId: string, userId: string) => {
  return apiFetch(`/workspaces/${workspaceId}/members/${userId}`, {
    method: 'DELETE',
  });
};

export const updateMemberRoleApi = (workspaceId: string, userId: string, data: { role: string }) => {
  return apiFetch(`/workspaces/${workspaceId}/members/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};
