import { Action, ActionResult } from './action.interface';
import { prisma } from '../../config/database'; // Restart nodemon

export class DatabaseAction implements Action {
  type = 'SAVE_TO_DB';

  async execute(payload: any): Promise<ActionResult> {
    const { table, data, _workspaceId } = payload;
    
    if (!table || !data || !_workspaceId) {
      return { success: false, error: 'Table, data, and workspaceId are required for SAVE_TO_DB' };
    }

    try {
      console.log(`[DatabaseAction] Saving to DataStore collection: ${table}`);
      
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

      const record = await prisma.dataStore.create({
        data: {
          collection: table,
          data: parsedData,
          workspaceId: _workspaceId
        }
      });

      return {
        success: true,
        data: { savedId: record.id, table: record.collection }
      };
    } catch (error: any) {
      console.error('[DatabaseAction] Error:', error);
      return { success: false, error: error.message };
    }
  }
}
