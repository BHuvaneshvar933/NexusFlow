import { prisma } from '../../config/database';
import { encrypt } from '../../utils/encryption';

export class SecretService {
  static async getSecrets(workspaceId: string) {
    // Only return metadata, never the decrypted or encrypted value
    const secrets = await prisma.secret.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return secrets;
  }

  static async createSecret(workspaceId: string, name: string, value: string, description?: string) {
    // Basic validation
    if (!name || !value) {
      throw new Error('Name and value are required');
    }

    // Encrypt the secret value before storing it
    const encryptedValue = encrypt(value);

    return prisma.secret.create({
      data: {
        name: name.toUpperCase().replace(/[^A-Z0-9_]/g, '_'), // Normalize name to uppercase snake_case
        description,
        value: encryptedValue,
        workspaceId
      },
      select: { // Do not return value
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  static async updateSecret(workspaceId: string, name: string, value: string, description?: string) {
    const existing = await prisma.secret.findUnique({
      where: {
        workspaceId_name: {
          workspaceId,
          name
        }
      }
    });

    if (!existing) {
      throw new Error('Secret not found');
    }

    const encryptedValue = encrypt(value);

    return prisma.secret.update({
      where: { id: existing.id },
      data: {
        value: encryptedValue,
        description: description !== undefined ? description : existing.description
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  static async deleteSecret(workspaceId: string, name: string) {
    const existing = await prisma.secret.findUnique({
      where: {
        workspaceId_name: {
          workspaceId,
          name
        }
      }
    });

    if (!existing) {
      throw new Error('Secret not found');
    }

    // Check if secret is used in workflows
    const workflows = await prisma.workflow.findMany({
      where: { workspaceId },
      include: { actions: true }
    });

    const usedInWorkflows = workflows.filter(w => {
      // Check if any action config has `{{secrets.NAME}}`
      const secretToken = `{{secrets.${name}}}`;
      return w.actions.some(action => {
        const configStr = JSON.stringify(action.config);
        return configStr.includes(secretToken);
      });
    });

    if (usedInWorkflows.length > 0) {
      const workflowNames = usedInWorkflows.map(w => w.name).join(', ');
      throw new Error(`Cannot delete secret. It is used by workflows: ${workflowNames}`);
    }

    await prisma.secret.delete({
      where: { id: existing.id }
    });
    
    return { success: true };
  }
}
