import { prisma } from '../../config/database';
import { ActionFactory } from '../actions/action.factory';
import { io } from '../../config/socket';

export class WorkflowEngine {
  async execute(workflowId: string, triggerData: any) {
    console.log(`[WorkflowEngine] Starting execution for workflow: ${workflowId}`);
    
    // 1. Load workflow from DB
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        actions: { orderBy: { sequence: 'asc' } },
      },
    });

    if (!workflow || !workflow.isActive) {
      throw new Error('Workflow not found or inactive');
    }

    // 2. Create execution record
    const execution = await prisma.execution.create({
      data: {
        workflowId,
        status: 'running',
        logs: [],
      },
    });

    // Notify listeners that execution has started
    io.to(`workflow-${workflowId}`).emit('execution:started', { executionId: execution.id });
    io.to(execution.id).emit('execution:started', { executionId: execution.id });

    // 3. Execute actions sequentially
    let context = { ...triggerData };
    const logs: any[] = [];

    for (const action of workflow.actions) {
      const stepStart = new Date();
      const logEntry = { step: action.actionType, status: 'STARTED', timestamp: stepStart };
      logs.push(logEntry);
      io.to(execution.id).emit('execution:log', { executionId: execution.id, log: logEntry });
      
      try {
        console.log(`[WorkflowEngine] Executing action: ${action.actionType}`);
        
        // Execute action
        const handler = ActionFactory.create(action.actionType);
        
        // Ensure config is treated as an object
        const config = typeof action.config === 'object' ? action.config : {};
        
        const result = await handler.execute({
          ...context,
          ...(config as any)
        });
        
        if (!result.success) {
          throw new Error(result.error || 'Action failed without specific error');
        }
        
        // Pass result to next action
        context = { ...context, ...result.data };
        
        const successLog = { 
          step: action.actionType, 
          status: 'SUCCESS', 
          timestamp: new Date(),
          durationMs: new Date().getTime() - stepStart.getTime()
        };
        logs.push(successLog);
        io.to(execution.id).emit('execution:log', { executionId: execution.id, log: successLog });
        
      } catch (error: any) {
        console.error(`[WorkflowEngine] Action failed: ${action.actionType}`, error);
        
        const errorLog = { 
          step: action.actionType, 
          status: 'FAILED', 
          error: error.message,
          timestamp: new Date()
        };
        logs.push(errorLog);
        io.to(execution.id).emit('execution:log', { executionId: execution.id, log: errorLog });

        // 4a. Mark execution failed
        await prisma.execution.update({
          where: { id: execution.id },
          data: {
            status: 'failed',
            error: error.message,
            logs: logs as any,
            completedAt: new Date(),
          },
        });
        
        io.to(execution.id).emit('execution:failed', { executionId: execution.id, error: error.message });
        io.to(`workflow-${workflowId}`).emit('execution:failed', { executionId: execution.id });
        return; // Stop execution on failure
      }
    }
    
    // 4b. Mark execution complete
    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: 'success',
        logs: logs as any,
        completedAt: new Date(),
      },
    });
    
    io.to(execution.id).emit('execution:completed', { executionId: execution.id });
    io.to(`workflow-${workflowId}`).emit('execution:completed', { executionId: execution.id });
    console.log(`[WorkflowEngine] Execution completed successfully: ${execution.id}`);
  }
}

export const workflowEngine = new WorkflowEngine();
