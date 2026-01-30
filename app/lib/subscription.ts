
import { db } from "@/app/lib/db";

export async function getUserPlan(userId: string) {
    const userPlan = await db.userPlan.findFirst({
        where: {
            userId,
            isActive: true,
        },
        include: {
            plan: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return userPlan?.plan;
}

export async function hasProPlan(userId: string) {
    const plan = await getUserPlan(userId);
    return plan?.name === "pro";
}

export async function checkWorkspaceLimit(userId: string): Promise<{ allowed: boolean; reason?: "limit_reached" | "pro_only" }> {
    const isPro = await hasProPlan(userId);

    if (isPro) {
        return { allowed: true };
    }

    // Free plan limit: 1 workspace
    const workspaceCount = await db.workspace.count({
        where: {
            ownerId: userId,
            deletedAt: null,
        },
    });

    if (workspaceCount >= 1) {
        return { allowed: false, reason: "limit_reached" };
    }

    return { allowed: true };
}

export async function checkInviteLimit(workspaceId: string, ownerId: string): Promise<{ allowed: boolean; reason?: "limit_reached" | "pro_only" }> {
    const isPro = await hasProPlan(ownerId);

    if (isPro) {
        return { allowed: true };
    }

    // Free plan limit: 2 users (owner + 1 invitee?)
    // "if the workspace already have 2 users" -> so max 2 users total, including owner.

    const userCount = await db.workspaceUser.count({
        where: {
            workspaceId,
            deletedAt: null,
        }
    });

    if (userCount >= 2) {
        return { allowed: false, reason: "limit_reached" };
    }

    return { allowed: true };
}
