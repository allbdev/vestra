"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/app/lib/session";
import { db } from "@/app/lib/db";
import { sendWorkspaceInviteEmail } from "@/app/lib/email";

export interface WorkspaceFormState {
  errors?: {
    name?: string[];
    _form?: string[];
  };
  message?: string;
  workspace?: {
    id: string;
    name: string;
  };
}

export async function createWorkspace(
  _prevState: WorkspaceFormState | undefined,
  formData: FormData
): Promise<WorkspaceFormState> {
  const user = await verifySession();

  if (!user) {
    return {
      errors: {
        _form: ["Não autenticado"],
      },
    };
  }

  const name = formData.get("name") as string;

  // Validate name
  if (!name || name.trim().length < 2) {
    return {
      errors: {
        name: ["Nome do workspace é obrigatório e deve ter pelo menos 2 caracteres"],
      },
    };
  }

  if (name.trim().length > 255) {
    return {
      errors: {
        name: ["Nome deve ter no máximo 255 caracteres"],
      },
    };
  }

  let workspaceId: string;
  
  try {
    // Create workspace
    const workspace = await db.workspace.create({
      data: {
        name: name.trim(),
        ownerId: user.id,
      },
    });

    workspaceId = workspace.id;

    // Add user as workspace member
    await db.workspaceUser.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    });
  } catch (error: any) {
    console.error("Create workspace error:", error);
    return {
      errors: {
        _form: ["Erro ao criar workspace. Tente novamente."],
      },
    };
  }

  // Redirect outside try-catch so the redirect error can propagate
  redirect(`/workspace/${workspaceId}/dashboard`);
}

export async function inviteUser(
  workspaceId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const user = await verifySession();

  if (!user) {
    return {
      success: false,
      error: "Não autenticado",
    };
  }

  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      success: false,
      error: "E-mail inválido",
    };
  }

  try {
    // Check if workspace exists and user is owner
    const workspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        deletedAt: null,
        ownerId: user.id,
      },
    });

    if (!workspace) {
      return {
        success: false,
        error: "Workspace não encontrado ou sem permissão",
      };
    }

    // Check if user to invite exists
    const userToInvite = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!userToInvite) {
      return {
        success: false,
        error: "Usuário não encontrado",
      };
    }

    // Check if user is already a member
    const existingMember = await db.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId: userToInvite.id,
        deletedAt: null,
      },
    });

    if (existingMember) {
      return {
        success: false,
        error: "Usuário já é membro do workspace",
      };
    }

    // Check if there's already an invite (any status)
    const existingInvite = await db.workspaceInvite.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: userToInvite.id,
        },
      },
    });

    let inviteId: string;

    if (existingInvite) {
      // If there's a pending invite, return error
      if (existingInvite.status === "waiting") {
        return {
          success: false,
          error: "Convite já enviado para este usuário",
        };
      }
      
      // If there's an old invite (accepted/rejected), update it to waiting
      const updatedInvite = await db.workspaceInvite.update({
        where: {
          id: existingInvite.id,
        },
        data: {
          status: "waiting",
          createdAt: new Date(), // Reset the creation date
        },
      });
      inviteId = updatedInvite.id;
    } else {
      // Create new invite if none exists
      const newInvite = await db.workspaceInvite.create({
        data: {
          workspaceId,
          userId: userToInvite.id,
          status: "waiting",
        },
      });
      inviteId = newInvite.id;
    }

    // Send invitation email
    const emailResult = await sendWorkspaceInviteEmail(
      userToInvite.email,
      workspace.name,
      workspaceId,
      userToInvite.id
    );

    if (!emailResult.success) {
      // Delete the invite if email fails
      await db.workspaceInvite.delete({
        where: { id: inviteId },
      });

      return {
        success: false,
        error: "Falha ao enviar e-mail de convite. Tente novamente.",
      };
    }

    // Revalidate the config page to show updated user list
    revalidatePath(`/workspace/${workspaceId}/config`);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Invite user error:", error);
    return {
      success: false,
      error: "Erro ao enviar convite. Tente novamente.",
    };
  }
}

export interface RemoveUserFormState {
  errors?: {
    _form?: string[];
  };
  message?: string;
}

export async function removeUser(
  prevState: RemoveUserFormState | undefined,
  formData: FormData
): Promise<RemoveUserFormState> {
  const user = await verifySession();

  if (!user) {
    return {
      errors: {
        _form: ["Não autenticado"],
      },
    };
  }

  const workspaceId = formData.get("workspaceId") as string;
  const userId = formData.get("userId") as string;

  if (!workspaceId || !userId) {
    return {
      errors: {
        _form: ["Dados inválidos"],
      },
    };
  }

  try {
    // Check if workspace exists and user is owner
    const workspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        deletedAt: null,
        ownerId: user.id,
      },
    });

    if (!workspace) {
      return {
        errors: {
          _form: ["Workspace não encontrado ou sem permissão"],
        },
      };
    }

    // Check if user to remove is not the owner
    if (workspace.ownerId === userId) {
      return {
        errors: {
          _form: ["Não é possível remover o proprietário do workspace"],
        },
      };
    }

    // Check if user is in workspace
    const workspaceUser = await db.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId,
        deletedAt: null,
      },
    });

    if (!workspaceUser) {
      return {
        errors: {
          _form: ["Usuário não encontrado no workspace"],
        },
      };
    }

    // Soft delete the workspace user
    await db.workspaceUser.update({
      where: { id: workspaceUser.id },
      data: { deletedAt: new Date() },
    });

    // Revalidate the config page to show updated user list
    revalidatePath(`/workspace/${workspaceId}/config`);

    return {
      message: "Usuário removido com sucesso",
    };
  } catch (error: any) {
    console.error("Remove user error:", error);
    return {
      errors: {
        _form: ["Erro ao remover usuário. Tente novamente."],
      },
    };
  }
}

