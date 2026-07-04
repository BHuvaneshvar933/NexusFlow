import 'dotenv/config';
import { prisma } from './src/config/database';

async function main() {
  try {
    const workflows = await prisma.workflow.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    console.log('Workflows:', workflows);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
