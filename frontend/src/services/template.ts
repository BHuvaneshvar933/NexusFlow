import { apiFetch } from './api';

export interface SharedWorkflow {
  id: string;
  name: string;
  description: string;
  shareId: string;
  triggerType: string;
  isTemplate: boolean;
  actions: any[];
  workspace: {
    id: string;
    name: string;
  };
}

export const getTemplates = async (): Promise<SharedWorkflow[]> => {
  const response = await apiFetch('/workflows/public/templates', { method: 'GET' });
  return response.data;
};

export const getSharedWorkflow = async (shareId: string): Promise<SharedWorkflow> => {
  const response = await apiFetch(`/workflows/public/shared/${shareId}`, { method: 'GET' });
  return response.data;
};

export const duplicateSharedWorkflow = async (shareId: string, targetWorkspaceId: string) => {
  const response = await apiFetch(`/workflows/public/shared/${shareId}/duplicate`, {
    method: 'POST',
    headers: {
      'x-workspace-id': targetWorkspaceId
    }
  });
  return response.data;
};

export const shareWorkflow = async (workflowId: string, workspaceId: string): Promise<{ shareId: string }> => {
  const response = await apiFetch(`/workflows/${workflowId}/share`, {
    method: 'POST',
    headers: {
      'x-workspace-id': workspaceId
    }
  });
  return response.data;
};
