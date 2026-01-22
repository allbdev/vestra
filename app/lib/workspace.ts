import { db } from "./db";

export interface WorkspaceAccess {
  workspaceId: string;
  isOwner: boolean;
  isMember: boolean;
}

/**
 * Check if a user has access to a workspace
 * Returns workspace access info or null if no access
 */
export async function checkWorkspaceAccess(
  workspaceId: string,
  userId: string
): Promise<WorkspaceAccess | null> {
  const workspace = await db.workspace.findFirst({
    where: {
      id: workspaceId,
      deletedAt: null,
    },
    include: {
      users: {
        where: {
          userId,
          deletedAt: null,
        },
      },
    },
  });

  if (!workspace) {
    return null;
  }

  const isOwner = workspace.ownerId === userId;
  const isMember = workspace.users.length > 0;

  // User has access if they are owner or member
  if (!isOwner && !isMember) {
    return null;
  }

  return {
    workspaceId,
    isOwner,
    isMember,
  };
}

/**
 * Get all workspace IDs that a user has access to
 */
export async function getUserWorkspaceIds(userId: string): Promise<string[]> {
  const workspaces = await db.workspace.findMany({
    where: {
      deletedAt: null,
      OR: [
        { ownerId: userId },
        {
          users: {
            some: {
              userId,
              deletedAt: null,
            },
          },
        },
      ],
    },
    select: { id: true },
  });

  return workspaces.map((w) => w.id);
}

