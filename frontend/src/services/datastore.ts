import { apiFetch } from './api';

export const getCollectionsApi = (workspaceId: string) => {
  return apiFetch(`/workspaces/${workspaceId}/datastore/collections`, { method: 'GET' });
};

export const getDocumentsApi = (workspaceId: string, collectionName: string) => {
  return apiFetch(`/workspaces/${workspaceId}/datastore/collections/${collectionName}/documents`, { method: 'GET' });
};

export const deleteDocumentApi = (workspaceId: string, documentId: string) => {
  return apiFetch(`/workspaces/${workspaceId}/datastore/documents/${documentId}`, { method: 'DELETE' });
};

export const createCollectionApi = (workspaceId: string, name: string) => {
  return apiFetch(`/workspaces/${workspaceId}/datastore/collections`, { 
    method: 'POST',
    body: JSON.stringify({ name })
  });
};

export const deleteCollectionApi = (workspaceId: string, collectionName: string) => {
  return apiFetch(`/workspaces/${workspaceId}/datastore/collections/${collectionName}`, { method: 'DELETE' });
};

export const createDocumentApi = (workspaceId: string, collectionName: string, data: any) => {
  return apiFetch(`/workspaces/${workspaceId}/datastore/collections/${collectionName}/documents`, { 
    method: 'POST',
    body: JSON.stringify({ data })
  });
};

export const updateDocumentApi = (workspaceId: string, documentId: string, data: any) => {
  return apiFetch(`/workspaces/${workspaceId}/datastore/documents/${documentId}`, { 
    method: 'PUT',
    body: JSON.stringify({ data })
  });
};
