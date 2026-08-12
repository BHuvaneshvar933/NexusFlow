import { describe, it, expect, jest, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import workflowRoutes from '../../src/modules/workflows/workflow.routes';
import { prisma } from '../../src/config/database';
import { workflowQueue } from '../../src/queues/workflow.queue';
import { protect } from '../../src/middleware/auth.middleware';
import jwt from 'jsonwebtoken';

// Setup isolated express app for workflow routes
const app = express();
app.use(express.json());

// Apply global auth middleware since workflows are protected
app.use('/api/workflows', protect, workflowRoutes);

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500).json({ success: false, message: err.message || 'Error' });
});

// Mock dependencies
jest.mock('../../src/config/database', () => ({
  prisma: {
    workflow: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    execution: {
      create: jest.fn(),
    },
    workspaceMember: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../src/queues/workflow.queue', () => ({
  workflowQueue: {
    add: jest.fn(),
  },
}));

// Mock cron worker dependency inside controller
jest.mock('../../src/queues/cron.queue', () => ({
  cronQueue: {
    getRepeatableJobs: (jest.fn() as any).mockResolvedValue([]),
    removeRepeatableByKey: jest.fn(),
    add: jest.fn(),
  }
}));

describe('Workflow Integration API', () => {
  let validToken: string;

  beforeAll(() => {
    validToken = jwt.sign({ id: 'u_1', email: 'test@example.com', role: 'user' }, process.env.JWT_SECRET || 'fallback_secret');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Allow authentication middleware to pass by finding a workspace member
    (prisma.workspaceMember.findUnique as any).mockResolvedValue({
      id: 'wm_1',
      workspaceId: 'ws_1',
      userId: 'u_1',
      role: 'owner'
    });
  });

  describe('GET /api/workflows', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(app).get('/api/workflows');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Authentication required');
    });

    it('should return workflows for an authenticated user with a workspace', async () => {
      (prisma.workflow.findMany as any).mockResolvedValue([
        { id: 'w_1', name: 'My Workflow' }
      ]);

      const response = await request(app)
        .get('/api/workflows')
        .set('Authorization', `Bearer ${validToken}`)
        .set('x-workspace-id', 'ws_1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(prisma.workflow.findMany).toHaveBeenCalled();
    });
  });

  describe('POST /api/workflows/:id/trigger', () => {
    it('should trigger an active workflow and queue it in BullMQ', async () => {
      (prisma.workflow.findFirst as any).mockResolvedValue({
        id: 'w_1',
        isActive: true,
      });
      (prisma.execution.create as any).mockResolvedValue({
        id: 'exec_1',
      });

      const response = await request(app)
        .post('/api/workflows/w_1/trigger')
        .set('Authorization', `Bearer ${validToken}`)
        .set('x-workspace-id', 'ws_1')
        .send({ event: 'test_event' });

      expect(response.status).toBe(202);
      expect(response.body.success).toBe(true);
      expect(response.body.data.executionId).toBe('exec_1');
      
      // Verify job was queued
      expect(workflowQueue.add).toHaveBeenCalledWith('execute', {
        workflowId: 'w_1',
        executionId: 'exec_1',
        triggerData: { event: 'test_event' },
      });
    });

    it('should return 400 if workflow is inactive', async () => {
      (prisma.workflow.findFirst as any).mockResolvedValue({
        id: 'w_1',
        isActive: false,
      });

      const response = await request(app)
        .post('/api/workflows/w_1/trigger')
        .set('Authorization', `Bearer ${validToken}`)
        .set('x-workspace-id', 'ws_1');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Workflow is currently inactive');
      expect(workflowQueue.add).not.toHaveBeenCalled();
    });
  });
});
