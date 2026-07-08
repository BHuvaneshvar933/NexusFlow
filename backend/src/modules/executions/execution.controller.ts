import { Request, Response } from 'express'; // Restart nodemon
import { prisma } from '../../config/database';
import { sendSuccess, sendError } from '../../utils/response';

export const getAllExecutionsByWorkspace = async (req: Request, res: Response) => {
  try {
    const workspaceId = (req as any).workspaceId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const statusFilter = req.query.status as string;

    const whereClause: any = {
      workflow: {
        workspaceId
      }
    };

    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter;
    }

    const [executions, total] = await Promise.all([
      prisma.execution.findMany({
        where: whereClause,
        include: {
          workflow: true
        },
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.execution.count({ where: whereClause })
    ]);

    return sendSuccess(res, {
      executions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, 'Executions retrieved successfully');
  } catch (error) {
    return sendError(res, 'Failed to fetch executions', 500, error);
  }
};

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
