'use server'

import { createInviteSession } from "@/app/actions/invite";

export async function createSession(workspaceId: string, userId: string) {
  try {
    await createInviteSession(workspaceId, userId);
    return true
  } catch (error) {
    console.error("Create session error:", error);
    return false
  }
}