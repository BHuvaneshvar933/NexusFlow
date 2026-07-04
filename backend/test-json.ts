import 'dotenv/config';
import { prisma } from './src/config/database';

async function main() {
  try {
    const exec = await prisma.execution.create({
      data: {
        workflowId: 'c3c7a3b8-51a9-4baa-b83c-f511d33fd761',
        logs: [{ timestamp: new Date() }] as any
      }
    });
    console.log('Success:', exec);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
