import { cache } from "react";
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
 * Internal implementation for getting all workspaces
 */
async function getUserWorkspacesInternal(): Promise<WorkspaceData[]> {
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

  return workspaces.map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    ownerId: workspace.ownerId,
    isOwner: workspace.ownerId === user.id,
    owner: workspace.owner,
    _count: workspace._count,
  }));
}

/**
 * Get all workspaces for the authenticated user
 * 
 * CACHED: Uses React's cache() to ensure only ONE database query
 * per request, regardless of how many times this is called.
 */
export const getUserWorkspaces = cache(getUserWorkspacesInternal);

/**
 * Internal implementation for getting a single workspace
 */
async function getWorkspaceInternal(workspaceId: string): Promise<WorkspaceData | null> {
  const user = await verifySession();

  if (!user) {
    return null;
  }

  const workspace = await db.workspace.findFirst({
    where: {
      id: workspaceId,
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
    },
  });

  if (!workspace) {
    return null;
  }

  return {
    id: workspace.id,
    name: workspace.name,
    ownerId: workspace.ownerId,
    isOwner: workspace.ownerId === user.id,
    owner: workspace.owner,
  };
}

/**
 * Get a single workspace by ID if user has access
 * 
 * CACHED: Uses React's cache() to ensure only ONE database query
 * per request for the same workspaceId.
 */
export const getWorkspace = cache(getWorkspaceInternal);

