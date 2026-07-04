import 'dotenv/config';
import { prisma } from './src/config/database';

async function main() {
  const workflowId = 'c3c7a3b8-51a9-4baa-b83c-f511d33fd761';
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: { actions: true }
  });
  console.log(JSON.stringify(workflow?.actions, null, 2));
  await prisma.$disconnect();
}
main();
