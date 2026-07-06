import { Queue } from 'bullmq';
import { redis } from '../config/redis';

// Dedicated queue for repeatable cron jobs
export const cronQueue = new Queue('cron-queue', {
  connection: redis as any,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
  },
});
