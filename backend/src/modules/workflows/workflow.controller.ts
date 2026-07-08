import { Request, Response } from 'express'; // triggering nodemon restart
import { prisma } from '../../config/database';
import { sendSuccess, sendError } from '../../utils/response';
import { cronQueue } from '../../queues/cron.queue';

const updateCronJob = async (workflowId: string, isActive: boolean, cronExpression: string | null) => {
  try {
    const repeatableJobs = await cronQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      if (job.name === workflowId || job.name === 'cron-trigger') {
        await cronQueue.removeRepeatableByKey(job.key);
      }
    }
    
    if (isActive && cronExpression) {
      await cronQueue.add(
        workflowId, // Use workflowId as the unique job name
        { workflowId },
        { 
          repeat: { pattern: cronExpression }
        }
      );
    }
  } catch (err) {
    console.error('Error updating cron job for workflow', workflowId, err);
  }
};

export const getWorkflows = async (req: Request, res: Response) => {
  try {
    const workspaceId = (req as any).workspaceId;
    if (!workspaceId) {
      return sendError(res, 'Workspace ID required', 400);
    }
    
    const workflows = await prisma.workflow.findMany({
      where: { workspaceId },
      include: {
        workspace: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
    return sendSuccess(res, workflows, 'Workflows retrieved successfully');
  } catch (error) {
    return sendError(res, 'Failed to fetch workflows', 500, error);
  }
};

export const getWorkflowById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workspaceId = (req as any).workspaceId;

    const workflow = await prisma.workflow.findFirst({
      where: { id: id as string, workspaceId },
      include: {
        actions: { orderBy: { sequence: 'asc' } },
        workspace: { select: { id: true, name: true } },
      },
    });
    
    if (!workflow) {
      return sendError(res, 'Workflow not found', 404);
    }
    
    return sendSuccess(res, workflow, 'Workflow retrieved successfully');
  } catch (error) {
    return sendError(res, 'Failed to fetch workflow', 500, error);
  }
};

export const createWorkflow = async (req: Request, res: Response) => {
  try {
    const { name, description, triggerType, cronExpression, testPayload, actions, isActive } = req.body;
    
    const workspaceId = (req as any).workspaceId;
    
    if (!workspaceId) {
      return sendError(res, 'Workspace ID not found in request', 400);
    }

    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        triggerType,
        cronExpression,
        testPayload,
        isActive: isActive || false,
        workspaceId,
        // Nested create for actions
        actions: {
          create: actions?.map((action: any, index: number) => ({
            actionType: action.actionType,
            config: action.config || {},
            sequence: index,
          })) || [],
        },
      },
      include: {
        actions: true, // Return the created actions in the response
      }
    });
    
    if (workflow.triggerType === 'CRON') {
      await updateCronJob(workflow.id, workflow.isActive, workflow.cronExpression);
    }
    
    return sendSuccess(res, workflow, 'Workflow created successfully', 201);
  } catch (error) {
    return sendError(res, 'Failed to create workflow', 500, error);
  }
};

export const updateWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workspaceId = (req as any).workspaceId;
    const { name, description, triggerType, cronExpression, testPayload, isActive, actions } = req.body;
    
    // Ensure workflow belongs to workspace
    const existing = await prisma.workflow.findFirst({ where: { id: id as string, workspaceId } });
    if (!existing) return sendError(res, 'Workflow not found', 404);

    const workflow = await prisma.workflow.update({
      where: { id: id as string },
      data: {
        name,
        description,
        triggerType,
        cronExpression,
        testPayload,
        isActive,
        ...(actions && {
          actions: {
            deleteMany: {},
            create: actions.map((action: any, index: number) => ({
              actionType: action.actionType,
              config: action.config || {},
              sequence: index,
            })),
          },
        }),
      },
      include: {
        actions: true,
      },
    });
    
    if (workflow.triggerType === 'CRON' || triggerType === 'CRON') {
      await updateCronJob(workflow.id, workflow.isActive && workflow.triggerType === 'CRON', workflow.cronExpression);
    } else {
      // If it was changed away from CRON, remove any existing jobs
      await updateCronJob(workflow.id, false, null);
    }
    
    return sendSuccess(res, workflow, 'Workflow updated successfully');
  } catch (error) {
    return sendError(res, 'Failed to update workflow', 500, error);
  }
};

export const deleteWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workspaceId = (req as any).workspaceId;

    const existing = await prisma.workflow.findFirst({ where: { id: id as string, workspaceId } });
    if (!existing) return sendError(res, 'Workflow not found', 404);

    await prisma.workflow.delete({
      where: { id: id as string },
    });
    
    await updateCronJob(id as string, false, null);
    
    return sendSuccess(res, null, 'Workflow deleted successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete workflow', 500, error);
  }
};

import { workflowQueue } from '../../queues/workflow.queue';

export const triggerWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const triggerData = req.body;

    const workspaceId = (req as any).workspaceId;

    const workflow = await prisma.workflow.findFirst({
      where: { id: id as string, workspaceId },
    });

    if (!workflow) {
      return sendError(res, 'Workflow not found or unauthorized', 404);
    }

    if (!workflow.isActive) {
      return sendError(res, 'Workflow is currently inactive', 400);
    }

    // Create execution record synchronously first
    const execution = await prisma.execution.create({
      data: {
        workflowId: workflow.id,
        status: 'pending',
        logs: [],
      },
    });

    // Push execution job to BullMQ
    await workflowQueue.add('execute', {
      workflowId: id,
      executionId: execution.id,
      triggerData,
    });

    return sendSuccess(res, { executionId: execution.id }, 'Workflow queued for execution', 202);
  } catch (error) {
    return sendError(res, 'Failed to trigger workflow', 500, error);
  }
};
