import { Action, ActionResult } from './action.interface';
import vm from 'vm';

export interface ConditionActionPayload {
  config: {
    condition: string; // e.g. "variables['1'].http_response.status === 200"
  };
  context: {
    variables: Record<string, any>;
    env: Record<string, string | undefined>;
  };
}

export class ConditionAction implements Action<ConditionActionPayload> {
  type = 'CONDITION';

  async execute(payload: ConditionActionPayload): Promise<ActionResult> {
    const { config, context } = payload;
    
    if (!config.condition) {
      return { success: false, error: 'Condition expression is missing' };
    }

    try {
      // Create a secure sandbox environment
      const sandbox = {
        variables: context.variables,
        env: context.env,
        console: {
          log: (...args: any[]) => console.log('[Condition]', ...args),
          error: (...args: any[]) => console.error('[Condition]', ...args),
        },
        result: false,
      };

      vm.createContext(sandbox);

      // Execute the condition and assign it to the 'result' variable in the sandbox
      const script = new vm.Script(`result = !!(${config.condition});`);
      script.runInContext(sandbox, { timeout: 1000 }); // 1 second timeout

      const isMet = sandbox.result;

      if (isMet) {
        return { 
          success: true, 
          halt: false,
          data: { met: true, expression: config.condition }
        };
      } else {
        return { 
          success: true, 
          halt: true, 
          data: { met: false, expression: config.condition }
        };
      }
    } catch (error: any) {
      console.error('[ConditionAction] Error:', error);
      return { success: false, error: error.message || 'Error executing condition' };
    }
  }
}
