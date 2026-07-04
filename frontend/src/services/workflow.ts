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
