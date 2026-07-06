import { apiFetch } from './api';

export const createWorkflowApi = async (data: any) => {
  return apiFetch('/workflows', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getWorkflowsApi = async () => {
  return apiFetch('/workflows', {
    method: 'GET',
  });
};

export const triggerWorkflowApi = async (id: string, triggerData: any) => {
  return apiFetch(`/workflows/${id}/trigger`, {
    method: 'POST',
    body: JSON.stringify(triggerData),
  });
};

export const getWorkflowApi = async (id: string) => {
  return apiFetch(`/workflows/${id}`, {
    method: 'GET',
  });
};

export const updateWorkflowApi = async (id: string, data: any) => {
  return apiFetch(`/workflows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteWorkflowApi = async (id: string) => {
  return apiFetch(`/workflows/${id}`, {
    method: 'DELETE',
  });
};
