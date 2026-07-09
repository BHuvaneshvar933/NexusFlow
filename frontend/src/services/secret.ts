import { apiFetch } from './api';

export const getSecretsApi = (workspaceId: string) => {
  return apiFetch(`/secrets/${workspaceId}`, { method: 'GET' });
};

export const createSecretApi = (workspaceId: string, data: { name: string; value: string; description?: string }) => {
  return apiFetch(`/secrets/${workspaceId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateSecretApi = (workspaceId: string, name: string, data: { value: string; description?: string }) => {
  return apiFetch(`/secrets/${workspaceId}/${name}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteSecretApi = (workspaceId: string, name: string) => {
  return apiFetch(`/secrets/${workspaceId}/${name}`, {
    method: 'DELETE',
  });
};
