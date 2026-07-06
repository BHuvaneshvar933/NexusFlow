import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { prisma } from '../config/database';
import { workflowQueue } from '../queues/workflow.queue';

export const cronWorker = new Worker(
  'cron-queue',
  async (job: Job) => {
    const { workflowId } = job.data;
    console.log(`[CronWorker] Processing scheduled trigger for workflow: ${workflowId}`);

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      console.warn(`[CronWorker] Workflow ${workflowId} not found`);
      return;
    }

    if (!workflow.isActive) {
      console.log(`[CronWorker] Workflow ${workflowId} is inactive, skipping execution.`);
      return;
    }

    // Create the execution
    const execution = await prisma.execution.create({
      data: {
        workflowId: workflow.id,
        status: 'pending',
        logs: [],
      },
    });

    // Pass the execution to the main workflow processor
    await workflowQueue.add('execute-workflow', {
      workflowId: workflow.id,
      executionId: execution.id,
      triggerData: { source: 'cron', timestamp: new Date().toISOString() },
    });

    console.log(`[CronWorker] Successfully spawned execution ${execution.id}`);
  },
  {
    connection: redis as any,
    concurrency: 5,
  }
);

cronWorker.on('failed', (job, err) => {
  console.error(`[CronWorker] Job ${job?.id} failed with error:`, err);
});
