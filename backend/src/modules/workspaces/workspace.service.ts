import { prisma } from '../../config/database';

export class WorkspaceService {
  static async getUserWorkspaces(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: true
      },
      orderBy: {
        workspace: {
          createdAt: 'asc'
        }
      }
    });

    return memberships.map(m => ({
      id: m.workspace.id,
      name: m.workspace.name,
      role: m.role,
      joinedAt: m.createdAt
    }));
  }

  static async createWorkspace(userId: string, name: string) {
    return prisma.workspace.create({
      data: {
        name,
        members: {
          create: {
            userId,
            role: 'owner'
          }
        }
      }
    });
  }

  static async inviteMember(workspaceId: string, email: string, role: string = 'editor') {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found. They must register first.');
    }

    const existing = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId
        }
      }
    });

    if (existing) {
      throw new Error('User is already a member of this workspace.');
    }

    return prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role
      }
    });
  }
}
