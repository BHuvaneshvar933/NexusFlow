import 'dotenv/config';
import { prisma } from './src/config/database';

async function main() {
  const workflows = await prisma.workflow.findMany({
    orderBy: { createdAt: 'desc' },
    include: { actions: true },
    take: 3
  });
  console.log(JSON.stringify(workflows, null, 2));
  await prisma.$disconnect();
}
main();
