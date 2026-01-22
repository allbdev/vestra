import { db } from "./db";
import { verifySession } from "./session";
import { redirect } from "next/navigation";

export interface WorkspaceConfigUser {
  id: string;
  name: string | null;
  email: string;
  isOwner: boolean;
  joinedAt: Date;
}

export interface WorkspaceConfigData {
  id: string;
  name: string;
  ownerId: string;
  isOwner: boolean;
  users: WorkspaceConfigUser[];
}

/**
 * Get workspace configuration data (workspace details and users)
 * Only accessible by workspace owner
 */
export async function getWorkspaceConfigData(
  workspaceId: string
): Promise<WorkspaceConfigData | null> {
  const user = await verifySession();

  if (!user) {
    redirect("/login");
  }

  // Find workspace where user is owner or member
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

  const isOwner = workspace.ownerId === user.id;

  // If not owner, return null (will redirect)
  if (!isOwner) {
    return null;
  }

  // Get all users in workspace
  const workspaceUsers = await db.workspaceUser.findMany({
    where: {
      workspaceId,
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return {
    id: workspace.id,
    name: workspace.name,
    ownerId: workspace.ownerId,
    isOwner: true,
    users: workspaceUsers.map((wu) => ({
      id: wu.user.id,
      name: wu.user.name,
      email: wu.user.email,
      isOwner: wu.userId === workspace.ownerId,
      joinedAt: wu.createdAt,
    })),
  };
}

