import { db } from "./db";
import { verifySession } from "./session";

export interface WorkspaceData {
  id: string;
  name: string;
  ownerId: string;
  isOwner: boolean;
  owner: {
    id: string;
    name: string | null;
    email: string;
  };
  _count?: {
    categories: number;
    transactions: number;
  };
}

/**
 * Get all workspaces for the authenticated user
 */
export async function getUserWorkspaces(): Promise<WorkspaceData[]> {
  const user = await verifySession();

  if (!user) {
    return [];
  }

  // Get workspaces where user is owner or member
  const workspaces = await db.workspace.findMany({
    where: {
      deletedAt: null,
      OR: [
        { ownerId: user.id },
        {
          users: {
            some: {
              userId: user.id,
              deletedAt: null,
            },
          },
        },
      ],
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          categories: {
            where: { deletedAt: null },
          },
          transactions: {
            where: { deletedAt: null },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform response to include isOwner flag
  return workspaces.map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    ownerId: workspace.ownerId,
    isOwner: workspace.ownerId === user.id,
    owner: workspace.owner,
    _count: workspace._count,
  }));
}

