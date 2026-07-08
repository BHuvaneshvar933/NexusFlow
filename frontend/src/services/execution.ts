import { apiFetch } from './api';

export const getExecutionsByWorkflowApi = async (workflowId: string) => {
  return apiFetch(`/executions/workflow/${workflowId}`, {
    method: 'GET',
  });
};

export const getExecutionByIdApi = async (id: string) => {
  return apiFetch(`/executions/${id}`, {
    method: 'GET',
  });
};

export const getAllExecutionsApi = async (page: number = 1, limit: number = 20, status?: string) => {
  let url = `/executions?page=${page}&limit=${limit}`;
  if (status && status !== 'ALL') {
    url += `&status=${status}`;
  }
  return apiFetch(url, {
    method: 'GET',
  });
};
