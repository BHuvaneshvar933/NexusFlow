import { config } from 'dotenv';
config();
import { prisma } from './src/config/database';

async function main() {
  const shareId = "tpl-stripe-slack";
  
  let ws = await prisma.workspace.findFirst({ where: { name: "NexusFlow Official Templates" } });
  if (!ws) {
    ws = await prisma.workspace.create({
      data: { name: "NexusFlow Official Templates" }
    });
  }

  await prisma.workflow.upsert({
    where: { shareId },
    update: {},
    create: {
      name: "Stripe to Slack Notification",
      description: "Send a Slack message whenever a Stripe payment succeeds.",
      triggerType: "WEBHOOK",
      isTemplate: true,
      isPublic: true,
      shareId,
      workspaceId: ws.id,
      actions: {
        create: [
          {
            actionType: "CONDITION",
            sequence: 1,
            config: { expression: "trigger.body.type === 'payment_intent.succeeded'" }
          },
          {
            actionType: "HTTP_REQUEST",
            sequence: 2,
            config: {
              method: "POST",
              url: "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
              headers: [{ key: "Content-Type", value: "application/json" }],
              body: "{\n  \"text\": \"🎉 New Payment! {{trigger.body.data.object.amount}}\"\n}"
            }
          }
        ]
      }
    }
  });
  console.log("Template seeded");
}
main().catch(console.error).finally(() => prisma.$disconnect());
