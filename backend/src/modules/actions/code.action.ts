import { Action, ActionResult } from './action.interface';
import vm from 'vm';

export class CustomCodeAction implements Action {
  type = 'CUSTOM_CODE';
  
  async execute(payload: any): Promise<ActionResult> {
    try {
      const { code } = payload;
      
      if (!code) {
        return { success: false, error: 'JavaScript code is required for Custom Code Action' };
      }
      
      console.log(`[CustomCodeAction] Executing custom script`);
      
      // Sandbox context provides isolated global variables
      const sandbox = {
        input: payload,
        output: {},
        console: {
          log: (...args: any[]) => console.log('[CustomCode Sandbox]', ...args),
          error: (...args: any[]) => console.error('[CustomCode Sandbox]', ...args),
        }
      };
      
      const context = vm.createContext(sandbox);
      
      // We wrap the user's code to make it async and allow them to set the output variable or return it.
      // E.g., user writes: `output.result = input.myVar * 2;`
      const script = new vm.Script(code);
      
      // Execute the script with a timeout to prevent infinite loops
      script.runInContext(context, { timeout: 1000 });
      
      return {
        success: true,
        data: sandbox.output
      };
    } catch (error: any) {
      console.error('[CustomCodeAction] Error:', error);
      return { success: false, error: error.message || 'Error executing custom code' };
    }
  }
}
