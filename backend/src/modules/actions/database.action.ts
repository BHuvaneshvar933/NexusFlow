import { Action, ActionResult } from './action.interface';

export class DatabaseAction implements Action {
  type = 'SAVE_TO_DB';

  async execute(payload: any): Promise<ActionResult> {
    console.log(`[DatabaseAction] Saving to table: ${payload.table}`);

    // Simulating async work 
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!payload.table || !payload.data) {
      return { success: false, error: 'Table and data are required for SAVE_TO_DB' };
    }

    return {
      success: true,
      data: { savedId: `sim_${Date.now()}`, table: payload.table }
    };
  }
}
