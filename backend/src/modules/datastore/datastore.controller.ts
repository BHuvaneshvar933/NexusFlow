import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess, sendError } from '../../utils/response';

export class DataStoreController {
  
  async getCollections(req: Request, res: Response) {
    try {
      const workspaceId = req.params.workspaceId as string;

      const collections = await prisma.dataStore.groupBy({
        by: ['collection'],
        where: { workspaceId },
        _count: {
          _all: true
        }
      });

      const result = collections.map(c => ({
        name: c.collection,
        count: c._count?._all || 0
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

      return sendSuccess(res, documents);
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
}

export const dataStoreController = new DataStoreController();
