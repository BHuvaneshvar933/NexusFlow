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

  static async updateWorkspace(id: string, name: string) {
    return prisma.workspace.update({
      where: { id },
      data: { name }
    });
  }

  static async deleteWorkspace(id: string) {
    // Prisma will cascade delete workflows, executions, dataStores, members, and secrets because of onDelete: Cascade
    await prisma.workspace.delete({
      where: { id }
    });
    return { success: true };
  }

  static async getMembers(workspaceId: string) {
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    return members;
  }

  static async removeMember(workspaceId: string, userId: string) {
    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } }
    });

    if (!member) {
      throw new Error('Member not found');
    }

    if (member.role === 'owner') {
      throw new Error('Cannot remove the owner. Transfer ownership first.');
    }

    await prisma.workspaceMember.delete({
      where: { userId_workspaceId: { userId, workspaceId } }
    });

    return { success: true };
  }

  static async updateMemberRole(workspaceId: string, userId: string, newRole: string) {
    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } }
    });

    if (!member) {
      throw new Error('Member not found');
    }

    if (member.role === 'owner') {
      throw new Error('Cannot change the role of the owner.');
    }

    if (newRole === 'owner') {
      throw new Error('Cannot promote to owner directly right now.');
    }

    return prisma.workspaceMember.update({
      where: { userId_workspaceId: { userId, workspaceId } },
      data: { role: newRole }
    });
  }
}
