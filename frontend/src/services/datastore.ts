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
