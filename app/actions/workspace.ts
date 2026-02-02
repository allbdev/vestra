"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/app/lib/session";
import { db } from "@/app/lib/db";
import { sendWorkspaceInviteEmail } from "@/app/lib/email";
import { cookies } from "next/headers";
import { storageKeys } from "../lib/consts";
import { checkWorkspaceLimit, checkInviteLimit } from "@/app/lib/subscription";

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
  limitReached?: boolean;
}

import { workspaceSchema, WorkspaceFormData } from "@/app/lib/schemas";
import * as yup from "yup";

// ... existing imports ...

export async function createWorkspace(
  _prevState: WorkspaceFormState | undefined,
  formData: FormData | WorkspaceFormData
): Promise<WorkspaceFormState> {
  const user = await verifySession();

  if (!user) {
    return {
      errors: {
        _form: ["Não autenticado"],
      },
    };
  }

  let name;
  if (formData instanceof FormData) {
      name = formData.get("name") as string;
  } else {
      name = formData.name;
  }
  
  try {
    await workspaceSchema.validate({ name }, { abortEarly: false });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
        const errors: WorkspaceFormState["errors"] = {};
        error.inner.forEach((err) => {
            if (err.path) {
                // @ts-ignore
                errors[err.path] = [err.message];
            }
        });
        return { errors };
        }
    return {
      errors: {
        _form: ["Erro de validação"],
      },
    };
  }

  // Check subscription limit
  const limitCheck = await checkWorkspaceLimit(user.id);
  if (!limitCheck.allowed) {
    return {
      errors: {
        _form: ["Limite de workspaces atingido. Faça o upgrade para o plano Pro."],
      },
      limitReached: true,
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

    // Check subscription limit for invites
    const limitCheck = await checkInviteLimit(workspaceId, user.id);
    if (!limitCheck.allowed) {
      return {
        success: false,
        error: "Limite de usuários no workspace atingido. Faça o upgrade para o plano Pro.", // Special code for frontend to handle
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
  formData: FormData | { workspaceId: string; userId: string }
): Promise<RemoveUserFormState> {
  const user = await verifySession();

  if (!user) {
    return {
      errors: {
        _form: ["Não autenticado"],
      },
    };
  }

  let workspaceId, userId;
  if (formData instanceof FormData) {
      workspaceId = formData.get("workspaceId") as string;
      userId = formData.get("userId") as string;
  } else {
      workspaceId = formData.workspaceId;
      userId = formData.userId;
  }

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

export interface UpdateWorkspaceNameFormState {
  errors?: {
    name?: string[];
    _form?: string[];
  };
  message?: string;
}

export async function updateWorkspaceName(
  prevState: UpdateWorkspaceNameFormState | undefined,
  formData: FormData | { workspaceId: string, name: string }
): Promise<UpdateWorkspaceNameFormState> {
  const user = await verifySession();

  if (!user) {
    return {
      errors: {
        _form: ["Não autenticado"],
      },
    };
  }

  let workspaceId, name;
  if (formData instanceof FormData) {
      workspaceId = formData.get("workspaceId") as string;
      name = formData.get("name") as string;
  } else {
      workspaceId = formData.workspaceId;
      name = formData.name;
  }

  if (!workspaceId) {
    return {
      errors: {
        _form: ["ID do workspace inválido"],
      },
    };
  }

  try {
    await workspaceSchema.validate({ name }, { abortEarly: false });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
        const errors: UpdateWorkspaceNameFormState["errors"] = {};
        error.inner.forEach((err) => {
            if (err.path) {
                // @ts-ignore
                errors[err.path] = [err.message];
            }
        });
        return { errors };
    }
    return {
      errors: {
        _form: ["Erro de validação"],
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

    // Update workspace name
    await db.workspace.update({
      where: { id: workspaceId },
      data: { name: name.trim() },
    });

    revalidatePath(`/workspace/${workspaceId}/config`);
    revalidatePath(`/workspace`);

    return {
      message: "Nome do workspace atualizado com sucesso",
    };
  } catch (error: any) {
    console.error("Update workspace name error:", error);
    return {
      errors: {
        _form: ["Erro ao atualizar nome do workspace. Tente novamente."],
      },
    };
  }
}

export interface DeleteWorkspaceFormState {
  errors?: {
    _form?: string[];
  };
  success?: boolean;
}

export async function deleteWorkspace(
  prevState: DeleteWorkspaceFormState | undefined,
  formData: FormData | { workspaceId: string }
): Promise<DeleteWorkspaceFormState> {
  const user = await verifySession();

  if (!user) {
    return {
      errors: {
        _form: ["Não autenticado"],
      },
    };
  }

  let workspaceId;
  if (formData instanceof FormData) {
      workspaceId = formData.get("workspaceId") as string;
  } else {
      workspaceId = formData.workspaceId;
  }

  if (!workspaceId) {
    return {
      errors: {
        _form: ["ID do workspace inválido"],
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

    // Soft delete workspace
    await db.workspace.update({
      where: { id: workspaceId },
      data: { deletedAt: new Date() },
    });

    // Check if the deleted workspace is the currently selected one
    const cookieStore = await cookies();
    const selectedWorkspaceId = cookieStore.get(storageKeys.selectedWorkspaceId)?.value;

    if (selectedWorkspaceId === workspaceId) {
      cookieStore.delete(storageKeys.selectedWorkspaceId);
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Delete workspace error:", error);
    return {
      errors: {
        _form: ["Erro ao excluir workspace. Tente novamente."],
      },
    };
  }
}

export interface LeaveWorkspaceFormState {
  errors?: {
    _form?: string[];
  };
  success?: boolean;
}

export async function leaveWorkspace(
  prevState: LeaveWorkspaceFormState | undefined,
  formData: FormData | { workspaceId: string }
): Promise<LeaveWorkspaceFormState> {
  const user = await verifySession();

  if (!user) {
    return {
      errors: {
        _form: ["Não autenticado"],
      },
    };
  }

  let workspaceId;
  if (formData instanceof FormData) {
      workspaceId = formData.get("workspaceId") as string;
  } else {
      workspaceId = formData.workspaceId;
  }

  if (!workspaceId) {
    return {
      errors: {
        _form: ["ID do workspace inválido"],
      },
    };
  }

  try {
    // Check if workspace exists
    const workspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        deletedAt: null,
      },
    });

    if (!workspace) {
      return {
        errors: {
          _form: ["Workspace não encontrado"],
        },
      };
    }

    // Check if user is the owner (cannot leave)
    if (workspace.ownerId === user.id) {
      return {
        errors: {
          _form: ["Proprietário não pode sair do workspace. Use a opção de excluir."],
        },
      };
    }

    // Check if user is member
    const workspaceUser = await db.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!workspaceUser) {
      return {
        errors: {
          _form: ["Você não é membro deste workspace"],
        },
      };
    }

    // Soft delete workspace user
    await db.workspaceUser.update({
      where: { id: workspaceUser.id },
      data: { deletedAt: new Date() },
    });

    // Check if the left workspace is the currently selected one
    const cookieStore = await cookies();
    const selectedWorkspaceId = cookieStore.get(storageKeys.selectedWorkspaceId)?.value;

    if (selectedWorkspaceId === workspaceId) {
      cookieStore.delete(storageKeys.selectedWorkspaceId);
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Leave workspace error:", error);
    return {
      errors: {
        _form: ["Erro ao sair do workspace. Tente novamente."],
      },
    };
  }
}


/**
 * Set session token in cookie
 */
export async function setSessionSelectedWorkspaceId(workspaceId: string): Promise<void> {
  const cookieStore = await cookies();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  cookieStore.set(storageKeys.selectedWorkspaceId, workspaceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function getSessionSelectedWorkspaceId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(storageKeys.selectedWorkspaceId)?.value || null;
}