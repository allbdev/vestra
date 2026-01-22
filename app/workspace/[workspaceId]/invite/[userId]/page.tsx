import { redirect } from "next/navigation";
import { db } from "@/app/lib/db";
import { generateSessionToken, getTokenExpiry } from "@/app/lib/auth";
import { InviteAcceptanceClient } from "./InviteAcceptanceClient";

interface PageProps {
  params: Promise<{ workspaceId: string; userId: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { workspaceId, userId } = await params;

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

  // Create a session for the user so they can view and interact with the invite page
  const sessionToken = generateSessionToken();
  const expiresAt = getTokenExpiry();

  await db.session.create({
    data: {
      userId: invite.user.id,
      token: sessionToken,
      expiresAt,
    },
  });

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
      sessionToken={sessionToken}
    />
  );
}

