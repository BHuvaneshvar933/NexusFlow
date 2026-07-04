import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess, sendError } from '../../utils/response';

export const getWorkflows = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'Unauthorized', 401);
    }
    
    const workflows = await prisma.workflow.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
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
    const workflow = await prisma.workflow.findUnique({
      where: { id: id as string },
      include: {
        actions: { orderBy: { sequence: 'asc' } },
        user: { select: { id: true, name: true, email: true } },
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
    const { name, description, triggerType, actions, isActive } = req.body;
    
    // We now have req.user from the protect middleware
    const userId = req.user?.id;
    
    if (!userId) {
      return sendError(res, 'User ID not found in request', 400);
    }

    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        triggerType,
        isActive: isActive || false,
        userId,
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
    
    return sendSuccess(res, workflow, 'Workflow created successfully', 201);
  } catch (error) {
    return sendError(res, 'Failed to create workflow', 500, error);
  }
};

export const updateWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, triggerType, isActive } = req.body;
    
    const workflow = await prisma.workflow.update({
      where: { id: id as string },
      data: {
        name,
        description,
        triggerType,
        isActive,
      },
    });
    
    return sendSuccess(res, workflow, 'Workflow updated successfully');
  } catch (error) {
    return sendError(res, 'Failed to update workflow', 500, error);
  }
};

export const deleteWorkflow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.workflow.delete({
      where: { id: id as string },
    });
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

    const workflow = await prisma.workflow.findUnique({
      where: { id: id as string },
    });

    if (!workflow || workflow.userId !== req.user?.id) {
      return sendError(res, 'Workflow not found or unauthorized', 404);
    }

    if (!workflow.isActive) {
      return sendError(res, 'Workflow is currently inactive', 400);
    }

    // Push execution job to BullMQ
    await workflowQueue.add('execute', {
      workflowId: id,
      triggerData,
    });

    return sendSuccess(res, null, 'Workflow queued for execution', 202);
  } catch (error) {
    return sendError(res, 'Failed to trigger workflow', 500, error);
  }
};
