import 'dotenv/config';
import { prisma } from './src/config/database';

async function main() {
  try {
    const workflow = await prisma.workflow.create({
      data: {
        name: 'Test Workflow with Config',
        description: 'Testing',
        triggerType: 'MANUAL',
        isActive: true,
        userId: 'f7beb56c-3fa8-4e75-b98c-5039c1468839',
        actions: {
          create: [
            {
              actionType: 'AI_ANALYZE',
              sequence: 0,
              config: { prompt: 'This is a test prompt' }
            }
          ]
        }
      },
      include: { actions: true }
    });
    console.log('Created:', JSON.stringify(workflow, null, 2));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
