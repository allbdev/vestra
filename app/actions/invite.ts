"use server";

import { redirect } from "next/navigation";
import { verifySession, setSessionToken } from "@/app/lib/session";
import { generateSessionToken, getTokenExpiry } from "@/app/lib/auth";
import { db } from "@/app/lib/db";

export interface AcceptInviteFormState {
  errors?: {
    _form?: string[];
  };
  message?: string;
  workspaceId?: string;
}

export async function acceptInvite(
  workspaceId: string,
  userId: string
): Promise<AcceptInviteFormState> {
  const user = await verifySession();

  if (!user) {
    return {
      errors: {
        _form: ["Não autenticado"],
      },
    };
  }

  // Verify that the authenticated user is the one being invited
  if (user.id !== userId) {
    return {
      errors: {
        _form: ["Você não tem permissão para aceitar este convite"],
      },
    };
  }

  try {
    // Find the invite
    const invite = await db.workspaceInvite.findFirst({
      where: {
        workspaceId,
        userId,
        status: "waiting",
      },
      include: {
        workspace: true,
      },
    });

    if (!invite) {
      return {
        errors: {
          _form: ["Convite não encontrado ou já foi processado"],
        },
      };
    }

    // Check if workspace still exists and is not deleted
    if (invite.workspace.deletedAt) {
      return {
        errors: {
          _form: ["Workspace não encontrado"],
        },
      };
    }

    // Check if user is already part of the workspace (active)
    const existingWorkspaceUser = await db.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId,
        deletedAt: null,
      },
    });

    if (existingWorkspaceUser) {
      // User is already active in workspace
      // Update invite status to accepted
      await db.workspaceInvite.update({
        where: { id: invite.id },
        data: { status: "accepted" },
      });

      return {
        message: "Você já faz parte deste workspace",
        workspaceId,
      };
    }

    // Add user to workspace (create new record, even if there's a soft-deleted one)
    await db.workspaceUser.create({
      data: {
        workspaceId,
        userId,
      },
    });

    // Update invite status to accepted
    await db.workspaceInvite.update({
      where: { id: invite.id },
      data: { status: "accepted" },
    });
  } catch (error: any) {
    console.error("Accept invite error:", error);
    return {
      errors: {
        _form: ["Erro ao aceitar convite. Tente novamente."],
      },
    };
  }

  // Redirect outside try-catch so the redirect error can propagate
  redirect(`/workspace/${workspaceId}/dashboard`);
}

export interface RejectInviteFormState {
  errors?: {
    _form?: string[];
  };
  message?: string;
}

export async function rejectInvite(
  workspaceId: string,
  userId: string
): Promise<RejectInviteFormState> {
  const user = await verifySession();

  if (!user) {
    return {
      errors: {
        _form: ["Não autenticado"],
      },
    };
  }

  // Verify that the authenticated user is the one being invited
  if (user.id !== userId) {
    return {
      errors: {
        _form: ["Você não tem permissão para recusar este convite"],
      },
    };
  }

  try {
    // Find the invite
    const invite = await db.workspaceInvite.findFirst({
      where: {
        workspaceId,
        userId,
        status: "waiting",
      },
    });

    if (!invite) {
      return {
        errors: {
          _form: ["Convite não encontrado ou já foi processado"],
        },
      };
    }

    // Update invite status to rejected
    await db.workspaceInvite.update({
      where: { id: invite.id },
      data: { status: "rejected" },
    });
  } catch (error: any) {
    console.error("Reject invite error:", error);
    return {
      errors: {
        _form: ["Erro ao recusar convite. Tente novamente."],
      },
    };
  }

  // Redirect outside try-catch so the redirect error can propagate
  redirect("/workspace");
}

/**
 * Create a session for an invite route
 * This is called from Server Components when a user accesses an invite link without a session
 */
export async function createInviteSession(
  workspaceId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find the invite
    const invite = await db.workspaceInvite.findFirst({
      where: {
        workspaceId,
        userId,
        status: "waiting",
      },
      include: {
        workspace: {
          select: {
            id: true,
            deletedAt: true,
          },
        },
        user: {
          select: {
            id: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!invite) {
      return { success: false, error: "Convite não encontrado" };
    }

    // Check if workspace still exists and is not deleted
    if (invite.workspace.deletedAt) {
      return { success: false, error: "Workspace não encontrado" };
    }

    // Check if user exists and is not deleted
    if (!invite.user || invite.user.deletedAt) {
      return { success: false, error: "Usuário não encontrado" };
    }

    // Create a session for the user
    const sessionToken = generateSessionToken();
    const expiresAt = getTokenExpiry();

    await db.session.create({
      data: {
        userId: invite.user.id,
        token: sessionToken,
        expiresAt,
      },
    });

    // Set session token in cookie
    await setSessionToken(sessionToken);

    return { success: true };
  } catch (error: any) {
    console.error("Create invite session error:", error);
    return {
      success: false,
      error: "Erro ao criar sessão. Tente novamente.",
    };
  }
}

