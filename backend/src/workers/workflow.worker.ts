import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { workflowEngine } from '../modules/workflows/workflow.engine';

export const workflowWorker = new Worker(
  'workflow-execution',
  async (job: Job) => {
    console.log(`[Worker] Picked up job ${job.id} for workflow: ${job.data.workflowId}`);
    const { workflowId, triggerData, executionId } = job.data;
    
    // Execute the workflow via the core engine
    await workflowEngine.execute(workflowId, triggerData, executionId);
  },
  {
    connection: redis as any,
    concurrency: 5, // Process up to 5 workflows simultaneously
  }
);

workflowWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} has completed successfully`);
});

workflowWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} has failed with error:`, err.message);
});
