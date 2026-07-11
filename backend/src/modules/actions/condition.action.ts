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
        const payloadJson = JSON.stringify(payload || {});
        const parsedPayload = vm.evalCode(`JSON.parse(${JSON.stringify(payloadJson)})`);
        if (parsedPayload.error) {
           parsedPayload.error.dispose();
           throw new Error("Failed to parse payload");
        }
        
        const payloadHandle = parsedPayload.value;
        
        vm.setProp(vm.global, 'env', payloadHandle);
        
        const setGlobalIfPresent = (key: string) => {
          const propHandle = vm.getProp(payloadHandle, key);
          if (vm.typeof(propHandle) !== 'undefined') {
             vm.setProp(vm.global, key, propHandle);
          }
          propHandle.dispose();
        };

        setGlobalIfPresent('trigger');
        setGlobalIfPresent('steps');
        setGlobalIfPresent('secrets');
        setGlobalIfPresent('loop');
        
        const stepsHandle = vm.getProp(payloadHandle, 'steps');
        if (vm.typeof(stepsHandle) !== 'undefined') {
          vm.setProp(vm.global, 'variables', stepsHandle);
        }
        stepsHandle.dispose();
        
        payloadHandle.dispose();

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
