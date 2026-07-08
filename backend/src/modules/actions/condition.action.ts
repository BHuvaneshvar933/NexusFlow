import { Action, ActionResult } from './action.interface';
import { getQuickJS } from 'quickjs-emscripten';

export class ConditionAction implements Action<any> {
  type = 'CONDITION';

  async execute(payload: any): Promise<ActionResult> {
    const { condition, trigger, steps } = payload;
    
    if (!condition) {
      return { success: false, error: 'Condition expression is missing' };
    }

    try {
      const QuickJS = await getQuickJS();
      const vm = QuickJS.newContext();
      
      try {
        // Prepare global trigger object
        const triggerJson = JSON.stringify(trigger || {});
        const parsedTrigger = vm.evalCode(`JSON.parse(${JSON.stringify(triggerJson)})`);
        if (parsedTrigger.error) {
           parsedTrigger.error.dispose();
           throw new Error("Failed to parse trigger");
        }
        vm.setProp(vm.global, 'trigger', parsedTrigger.value);
        parsedTrigger.value.dispose();
        
        // Prepare global steps object
        const stepsJson = JSON.stringify(steps || {});
        const parsedSteps = vm.evalCode(`JSON.parse(${JSON.stringify(stepsJson)})`);
        if (parsedSteps.error) {
           parsedSteps.error.dispose();
           throw new Error("Failed to parse steps");
        }
        vm.setProp(vm.global, 'steps', parsedSteps.value);
        parsedSteps.value.dispose();

        // Execute the condition
        const script = `!!(${condition})`;
        const result = vm.evalCode(script);
        
        if (result.error) {
          const errorHandle = result.error;
          const errorString = vm.dump(errorHandle);
          errorHandle.dispose();
          throw new Error(String(errorString));
        }

        const isMet = vm.dump(result.value);
        result.value.dispose();

        if (isMet) {
          return { 
            success: true, 
            halt: false,
            data: { met: true, expression: condition }
          };
        } else {
          return { 
            success: true, 
            halt: true, 
            data: { met: false, expression: condition }
          };
        }
      } finally {
        vm.dispose();
      }
    } catch (error: any) {
      console.error('[ConditionAction] Error:', error);
      return { success: false, error: error.message || 'Error executing condition' };
    }
  }
}
