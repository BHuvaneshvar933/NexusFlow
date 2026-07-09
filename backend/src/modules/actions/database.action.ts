import { Action, ActionResult } from './action.interface';
import { prisma } from '../../config/database'; // Restart nodemon

export class DatabaseAction implements Action {
  type = 'SAVE_TO_DB';

  async execute(payload: any): Promise<ActionResult> {
    const { table, operation = 'CREATE', data, documentId, query, _workspaceId } = payload;
    
    if (!table || !_workspaceId) {
      return { success: false, error: 'Table and workspaceId are required for SAVE_TO_DB' };
    }

    try {
      console.log(`[DatabaseAction] Executing ${operation} on DataStore collection: ${table}`);
      
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      const parsedQuery = typeof query === 'string' ? JSON.parse(query) : query;

      switch (operation.toUpperCase()) {
        case 'CREATE': {
          if (!parsedData) return { success: false, error: 'Data is required for CREATE' };
          const record = await prisma.dataStore.create({
            data: { collection: table, data: parsedData, workspaceId: _workspaceId }
          });
          return { success: true, data: { savedId: record.id, table: record.collection } };
        }

        case 'READ': {
          if (!documentId) return { success: false, error: 'documentId is required for READ' };
          const record = await prisma.dataStore.findUnique({
            where: { id: documentId, workspaceId: _workspaceId }
          });
          return { success: true, data: record?.data || null };
        }

        case 'UPDATE': {
          if (!documentId || !parsedData) return { success: false, error: 'documentId and data are required for UPDATE' };
          const record = await prisma.dataStore.update({
            where: { id: documentId, workspaceId: _workspaceId },
            data: { data: parsedData }
          });
          return { success: true, data: { updatedId: record.id } };
        }

        case 'DELETE': {
          if (!documentId) return { success: false, error: 'documentId is required for DELETE' };
          await prisma.dataStore.delete({
            where: { id: documentId, workspaceId: _workspaceId }
          });
          return { success: true, data: { deletedId: documentId } };
        }

        case 'SEARCH': {
          if (!parsedQuery) return { success: false, error: 'query is required for SEARCH' };
          // For Prisma JSON filtering, we use raw querying or path. 
          // For simplicity, if query is { email: 'x' }, we fetch all and filter in memory, 
          // or use Prisma's JSON filtering if on postgres. Since we use postgres:
          const documents = await prisma.dataStore.findMany({
            where: {
              collection: table,
              workspaceId: _workspaceId,
              data: {
                path: [],
                equals: parsedQuery,
              }
            },
            take: 100
          });
          // Note: Prisma's basic equals on JSON matches the exact JSON structure. 
          // A more robust approach for nested querying without raw SQL is to fetch and filter in memory for simple datasets,
          // or use postgres specific jsonb functions.
          // Since this is a lightweight engine, we will do a basic findMany and filter in memory if needed.
          
          // Let's implement a more robust in-memory filter for the NoSQL feel:
          const allDocs = await prisma.dataStore.findMany({
            where: { collection: table, workspaceId: _workspaceId }
          });
          
          const filtered = allDocs.filter(doc => {
            const docData = doc.data as Record<string, any>;
            if (docData._isSentinel) return false;
            return Object.entries(parsedQuery).every(([key, value]) => docData[key] === value);
          });

          return { success: true, data: { count: filtered.length, results: filtered.map(d => d.data) } };
        }

        default:
          return { success: false, error: `Unsupported operation: ${operation}` };
      }
    } catch (error: any) {
      console.error('[DatabaseAction] Error:', error);
      return { success: false, error: error.message };
    }
  }
}
