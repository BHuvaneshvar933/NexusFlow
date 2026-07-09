import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess, sendError } from '../../utils/response';

export class DataStoreController {
  
  async getCollections(req: Request, res: Response) {
    try {
      const workspaceId = req.params.workspaceId as string;

      const collectionsRaw = await prisma.dataStore.groupBy({
        by: ['collection'],
        where: { workspaceId },
        _count: {
          _all: true
        }
      });

      const sentinels = await prisma.dataStore.findMany({
        where: {
          workspaceId,
          data: {
            path: ['_isSentinel'],
            equals: true
          }
        },
        select: { collection: true }
      });

      const sentinelSet = new Set(sentinels.map(s => s.collection));

      const result = collectionsRaw.map(c => ({
        name: c.collection,
        count: (c._count?._all || 0) - (sentinelSet.has(c.collection) ? 1 : 0)
      }));

      return sendSuccess(res, result);
    } catch (error: any) {
      console.error('getCollections error:', error);
      return sendError(res, error.message || 'Failed to fetch collections');
    }
  }

  async getDocuments(req: Request, res: Response) {
    try {
      const workspaceId = req.params.workspaceId as string;
      const collectionName = req.params.collectionName as string;

      const documents = await prisma.dataStore.findMany({
        where: {
          workspaceId,
          collection: collectionName
        },
        orderBy: { createdAt: 'desc' }
      });

      // Filter out sentinel documents
      const filteredDocuments = documents.filter(doc => {
        const data = doc.data as any;
        return data && data._isSentinel !== true;
      });

      return sendSuccess(res, filteredDocuments);
    } catch (error: any) {
      console.error('getDocuments error:', error);
      return sendError(res, error.message || 'Failed to fetch documents');
    }
  }

  async deleteDocument(req: Request, res: Response) {
    try {
      const workspaceId = req.params.workspaceId as string;
      const documentId = req.params.documentId as string;

      await prisma.dataStore.delete({
        where: {
          id: documentId,
          workspaceId
        }
      });

      return sendSuccess(res, { success: true });
    } catch (error: any) {
      console.error('deleteDocument error:', error);
      return sendError(res, error.message || 'Failed to delete document');
    }
  }

  async createCollection(req: Request, res: Response) {
    try {
      const workspaceId = req.params.workspaceId as string;
      const { name } = req.body;

      if (!name) return sendError(res, 'Collection name is required');

      // Create a sentinel document to register the collection
      await prisma.dataStore.create({
        data: {
          collection: name,
          workspaceId,
          data: { _isSentinel: true }
        }
      });

      return sendSuccess(res, { success: true });
    } catch (error: any) {
      console.error('createCollection error:', error);
      return sendError(res, error.message || 'Failed to create collection');
    }
  }

  async deleteCollection(req: Request, res: Response) {
    try {
      const workspaceId = req.params.workspaceId as string;
      const collectionName = req.params.collectionName as string;

      await prisma.dataStore.deleteMany({
        where: {
          workspaceId,
          collection: collectionName
        }
      });

      return sendSuccess(res, { success: true });
    } catch (error: any) {
      console.error('deleteCollection error:', error);
      return sendError(res, error.message || 'Failed to delete collection');
    }
  }

  async createDocument(req: Request, res: Response) {
    try {
      const workspaceId = req.params.workspaceId as string;
      const collectionName = req.params.collectionName as string;
      const { data } = req.body;

      if (!data) return sendError(res, 'Document data is required');

      const document = await prisma.dataStore.create({
        data: {
          collection: collectionName,
          workspaceId,
          data
        }
      });

      return sendSuccess(res, document);
    } catch (error: any) {
      console.error('createDocument error:', error);
      return sendError(res, error.message || 'Failed to create document');
    }
  }

  async updateDocument(req: Request, res: Response) {
    try {
      const workspaceId = req.params.workspaceId as string;
      const documentId = req.params.documentId as string;
      const { data } = req.body;

      if (!data) return sendError(res, 'Document data is required');

      const document = await prisma.dataStore.updateMany({
        where: {
          id: documentId,
          workspaceId
        },
        data: { data }
      });

      if (document.count === 0) return sendError(res, 'Document not found');

      return sendSuccess(res, { success: true });
    } catch (error: any) {
      console.error('updateDocument error:', error);
      return sendError(res, error.message || 'Failed to update document');
    }
  }
}

export const dataStoreController = new DataStoreController();
