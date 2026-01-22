import { redirect } from "next/navigation";
import { db } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";
import { InviteAcceptanceClient } from "./InviteAcceptanceClient";

interface PageProps {
  params: Promise<{ workspaceId: string; userId: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { workspaceId, userId } = await params;

  // Verify user is authenticated
  const user = await verifySession();

  // If no session, redirect to route handler to create one
  if (!user) {
    redirect(`/workspace/${workspaceId}/invite/${userId}/session`);
  }

  // Find the invite
  const invite = await db.workspaceInvite.findFirst({
    where: {
      workspaceId,
      userId,
      status: "waiting",
    },
    include: {
      workspace: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // If invite is invalid, redirect to 404
  if (!invite) {
    redirect("/404");
  }

  // Check if workspace still exists and is not deleted
  if (invite.workspace.deletedAt) {
    redirect("/404");
  }

  // Check if user is already part of the workspace
  const existingWorkspaceUser = await db.workspaceUser.findFirst({
    where: {
      workspaceId,
      userId,
      deletedAt: null,
    },
  });

  if (existingWorkspaceUser) {
    // Update invite status to accepted since user is already in workspace
    await db.workspaceInvite.update({
      where: { id: invite.id },
      data: { status: "accepted" },
    });
    redirect(`/workspace/${workspaceId}/dashboard`);
  }

  return (
    <InviteAcceptanceClient
      invite={{
        id: invite.id,
        workspaceId: invite.workspaceId,
        userId: invite.userId,
        status: invite.status,
        createdAt: invite.createdAt.toISOString(),
        workspace: {
          id: invite.workspace.id,
          name: invite.workspace.name,
          owner: invite.workspace.owner,
        },
        user: invite.user,
      }}
    />
  );
}

