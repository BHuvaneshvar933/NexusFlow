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
        // Set the global input variable securely
        const inputString = JSON.stringify(payload);
        const inputHandle = vm.newString(inputString);
        
        // Use JSON.parse in the VM to parse the string safely
        const jsonParseCode = `JSON.parse(${JSON.stringify(inputString)})`;
        const parsedInput = vm.evalCode(jsonParseCode);
        
        if (parsedInput.error) {
           parsedInput.error.dispose();
           throw new Error("Failed to parse input");
        }
        vm.setProp(vm.global, 'input', parsedInput.value);
        parsedInput.value.dispose();
        inputHandle.dispose();
        
        // Add an empty output object
        const outputHandle = vm.newObject();
        vm.setProp(vm.global, 'output', outputHandle);

        // Execute user code
        const result = vm.evalCode(code);
        
        if (result.error) {
          const errorHandle = result.error;
          const errorString = vm.dump(errorHandle);
          errorHandle.dispose();
          throw new Error(String(errorString));
        } else {
          result.value.dispose();
        }

        // Retrieve output object
        const finalOutputHandle = vm.getProp(vm.global, 'output');
        const dumpedOutput = vm.dump(finalOutputHandle);
        finalOutputHandle.dispose();
        outputHandle.dispose();

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
