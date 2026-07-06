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

export const inviteMemberApi = (data: { email: string; newRole?: string }) => {
  return apiFetch('/workspaces/members', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
