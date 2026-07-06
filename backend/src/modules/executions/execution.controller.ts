import { Request, Response } from 'express'; // Restart nodemon
import { prisma } from '../../config/database';
import { sendSuccess, sendError } from '../../utils/response';

export const getExecutionsByWorkflow = async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const workspaceId = (req as any).workspaceId;
    
    // Check if the workflow belongs to the workspace
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId as string, workspaceId },
    });

    if (!workflow) {
      return sendError(res, 'Workflow not found or unauthorized', 404);
    }

    const executions = await prisma.execution.findMany({
      where: { workflowId: workflowId as string },
      orderBy: { startedAt: 'desc' },
      take: 50, // Limit to recent executions
    });

    return sendSuccess(res, executions, 'Executions retrieved successfully');
  } catch (error) {
    return sendError(res, 'Failed to fetch executions', 500, error);
  }
};

export const getExecutionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workspaceId = (req as any).workspaceId;

    const execution = await prisma.execution.findUnique({
      where: { id: id as string },
      include: {
        workflow: true,
      },
    });

    if (!execution || execution.workflow.workspaceId !== workspaceId) {
      return sendError(res, 'Execution not found or unauthorized', 404);
    }

    return sendSuccess(res, execution, 'Execution retrieved successfully');
  } catch (error) {
    return sendError(res, 'Failed to fetch execution', 500, error);
  }
};
