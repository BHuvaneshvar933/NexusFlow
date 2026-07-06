import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { workflowQueue } from '../../queues/workflow.queue';
import { sendSuccess, sendError } from '../../utils/response';

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const payload = req.method === 'GET' ? req.query : req.body;

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId as string },
    });

    if (!workflow) {
      return sendError(res, 'Workflow not found', 404);
    }

    if (!workflow.isActive) {
      return sendError(res, 'Workflow is not active', 400);
    }

    const execution = await prisma.execution.create({
      data: {
        workflowId: workflow.id,
        status: 'pending',
        logs: [],
      },
    });

    await workflowQueue.add('execute-workflow', {
      workflowId: workflow.id,
      executionId: execution.id,
      triggerData: payload,
    });

    return sendSuccess(res, { executionId: execution.id, message: 'Workflow triggered' }, 'Webhook received');
  } catch (error) {
    return sendError(res, 'Webhook processing failed', 500, error);
  }
};
