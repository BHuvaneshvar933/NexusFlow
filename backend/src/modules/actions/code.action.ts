import { Action, ActionResult } from './action.interface';
import { getQuickJS } from 'quickjs-emscripten';

export class CustomCodeAction implements Action {
  type = 'CUSTOM_CODE';
  
  async execute(payload: any): Promise<ActionResult> {
    try {
      const { code } = payload;
      
      if (!code) {
        return { success: false, error: 'JavaScript code is required for Custom Code Action' };
      }
      
      console.log(`[CustomCodeAction] Executing custom script securely via QuickJS`);
      
      const QuickJS = await getQuickJS();
      const vm = QuickJS.newContext();
      
      try {
        const inputString = JSON.stringify(payload);
        
        // Use JSON.parse in the VM to parse the string safely
        const jsonParseCode = `JSON.parse(${JSON.stringify(inputString)})`;
        const parsedInput = vm.evalCode(jsonParseCode);
        
        if (parsedInput.error) {
           parsedInput.error.dispose();
           throw new Error("Failed to parse input");
        }
        
        const payloadHandle = parsedInput.value;
        
        vm.setProp(vm.global, 'input', payloadHandle);
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
        
        // variables is an alias for steps
        const stepsHandle = vm.getProp(payloadHandle, 'steps');
        if (vm.typeof(stepsHandle) !== 'undefined') {
          vm.setProp(vm.global, 'variables', stepsHandle);
        }
        stepsHandle.dispose();
        
        payloadHandle.dispose();
        
        // Add an empty output object
        const outputHandle = vm.newObject();
        vm.setProp(vm.global, 'output', outputHandle);

        let errorToThrow = null;
        let dumpedOutput = null;

        try {
          // Execute user code
          const result = vm.evalCode(code);
          
          if (result.error) {
            const errorHandle = result.error;
            errorToThrow = new Error(String(vm.dump(errorHandle)));
            errorHandle.dispose();
          } else {
            result.value.dispose();
          }

          // Retrieve output object if no error
          if (!errorToThrow) {
            const finalOutputHandle = vm.getProp(vm.global, 'output');
            dumpedOutput = vm.dump(finalOutputHandle);
            finalOutputHandle.dispose();
          }
        } finally {
          outputHandle.dispose();
        }
        
        if (errorToThrow) {
          throw errorToThrow;
        }

        return {
          success: true,
          data: dumpedOutput
        };
      } finally {
        vm.dispose();
      }
    } catch (error: any) {
      console.error('[CustomCodeAction] Error:', error);
      return { success: false, error: error.message || 'Error executing custom code' };
    }
  }
}
