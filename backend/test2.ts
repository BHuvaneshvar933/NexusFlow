import 'dotenv/config';
import { prisma } from './src/config/database';

async function main() {
  try {
    const workflows = await prisma.workflow.findMany({
      where: { userId: 'f7beb56c-3fa8-4e75-b98c-5039c1468839' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Workflows:', workflows);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
