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
