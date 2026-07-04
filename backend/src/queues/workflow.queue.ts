import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export const workflowQueue = new Queue('workflow-execution', {
  connection: redis as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
