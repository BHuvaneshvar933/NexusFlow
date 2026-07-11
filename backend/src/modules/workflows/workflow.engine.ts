import { prisma } from '../../config/database';
import { ActionFactory } from '../actions/action.factory';
import { io } from '../../config/socket';
import { interpolateConfig } from '../../utils/interpolate';
import { decrypt } from '../../utils/encryption';

export class WorkflowEngine {
  async execute(workflowId: string, triggerData: any, existingExecutionId?: string) {
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

    // 2. Create or update execution record
    let execution;
    if (existingExecutionId) {
      execution = await prisma.execution.update({
        where: { id: existingExecutionId },
        data: { status: 'running' }
      });
    } else {
      execution = await prisma.execution.create({
        data: {
          workflowId,
          status: 'running',
          logs: [],
          triggerData: triggerData,
        },
      });
    }

    // Notify listeners that execution has started
    io.to(`workflow-${workflowId}`).emit('execution:started', { executionId: execution.id });
    io.to(execution.id).emit('execution:started', { executionId: execution.id });

    // 3. Load secrets for the workspace
    const rawSecrets = await prisma.secret.findMany({
      where: { workspaceId: workflow.workspaceId }
    });
    
    const secretsMap: Record<string, string> = {};
    for (const secret of rawSecrets) {
      secretsMap[secret.name] = decrypt(secret.value);
    }

    // 4. Execute actions sequentially
    let context: any = { 
      trigger: { body: triggerData },
      steps: {},
      secrets: secretsMap
    };
    const logs: any[] = [];

    const success = await this.executeSequence(workflow.actions, context, execution.id, workflowId, workflow.workspaceId, logs);

    if (!success) {
      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          error: 'An action failed during execution',
          logs: logs as any,
          completedAt: new Date(),
        },
      });
      io.to(execution.id).emit('execution:failed', { executionId: execution.id, error: 'An action failed' });
      io.to(`workflow-${workflowId}`).emit('execution:failed', { executionId: execution.id });
      return;
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

  private async executeSequence(
    actions: any[], 
    context: any, 
    executionId: string, 
    workflowId: string, 
    workspaceId: string, 
    logs: any[]
  ): Promise<boolean> {
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const stepStart = new Date();
      // Append loop index if we are inside a loop to make logs clearer
      const stepLabel = context.loop ? `${action.actionType} (Item ${context.loop.index + 1})` : action.actionType;
      
      const logEntry = { step: stepLabel, status: 'STARTED', timestamp: stepStart };
      logs.push(logEntry);
      io.to(executionId).emit('execution:log', { executionId, log: logEntry });
      io.to(`workflow-${workflowId}`).emit('execution:log', { executionId, log: logEntry });
      
      try {
        console.log(`[WorkflowEngine] Executing action: ${action.actionType}`);
        
        const handler = ActionFactory.create(action.actionType);
        
        const config = (action.config && typeof action.config === 'object' && !Array.isArray(action.config) 
          ? action.config 
          : {}) as Record<string, any>;
        
        const interpolatedConfig = interpolateConfig(config, context);

        const result = await handler.execute({
          ...context,
          ...interpolatedConfig,
          _workspaceId: workspaceId
        });
        
        if (!result.success) {
          throw new Error(result.error || 'Action failed without specific error');
        }
        
        // Store result in steps namespace. If in loop, we still overwrite, which might be tricky but typical for iterators
        context.steps[`${action.sequence}`] = result.data || {};
        
        const successLog = { 
          step: stepLabel, 
          status: result.halt ? 'FILTERED' : 'SUCCESS', 
          timestamp: new Date(),
          durationMs: new Date().getTime() - stepStart.getTime(),
          data: result.data
        };
        logs.push(successLog);
        io.to(executionId).emit('execution:log', { executionId, log: successLog });
        io.to(`workflow-${workflowId}`).emit('execution:log', { executionId, log: successLog });
        
        if (result.halt) {
          console.log(`[WorkflowEngine] Workflow halted by filter condition.`);
          return true; // Halted successfully
        }

        // Handle ITERATOR splitting
        if (action.actionType === 'ITERATOR') {
          const items = result.data?.items || [];
          const remainingActions = actions.slice(i + 1);
          
          for (let j = 0; j < items.length; j++) {
            // Provide loop item to the context
            const loopContext = { ...context, loop: { item: items[j], index: j } };
            const success = await this.executeSequence(remainingActions, loopContext, executionId, workflowId, workspaceId, logs);
            if (!success) {
              return false; // Propagate failure up
            }
          }
          break; // Stop current sequence because the rest is handled by the loops
        }
        
      } catch (error: any) {
        console.error(`[WorkflowEngine] Action failed: ${action.actionType}`, error);
        
        const errorLog = { 
          step: stepLabel, 
          status: 'FAILED', 
          error: error.message,
          timestamp: new Date()
        };
        logs.push(errorLog);
        io.to(executionId).emit('execution:log', { executionId, log: errorLog });
        io.to(`workflow-${workflowId}`).emit('execution:log', { executionId, log: errorLog });

        return false;
      }
    }
    return true;
  }
}

export const workflowEngine = new WorkflowEngine();
