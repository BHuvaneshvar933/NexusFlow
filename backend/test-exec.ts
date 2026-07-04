import 'dotenv/config';
import { prisma } from './src/config/database';

async function main() {
  try {
    const executions = await prisma.execution.findMany({
      orderBy: { startedAt: 'desc' },
      take: 2
    });
    console.log(JSON.stringify(executions, null, 2));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
