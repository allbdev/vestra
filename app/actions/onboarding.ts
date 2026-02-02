"use server";

import { db } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";
import { revalidatePath } from "next/cache";

export async function getOnboardingStep() {
  const user = await verifySession();

  if (!user) {
    return null;
  }

  const onboarding = await db.onboarding.findFirst({
    where: {
      userId: user.id,
      completed: false, // We look for the current incomplete step
    },
    orderBy: {
      step: "asc", 
    },
  });

  return onboarding;
}

export async function completeOnboardingStep(step: number) {
  const user = await verifySession();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const onboarding = await db.onboarding.findFirst({
    where: {
      userId: user.id,
      step: step,
      completed: false,
    },
  });

  if (!onboarding) {
    // Already completed or doesn't exist
    return; 
  }

  // Mark current step as completed
  await db.onboarding.update({
    where: { id: onboarding.id },
    data: { completed: true },
  });

  // Create next step
  const nextStep = step + 1;
  
  // Define max steps if needed, but for now we just increment based on requirements
  // "When the user completes a step... create a new row with step + 1 and completed false"
  // Assuming there are 5 steps based on TOUR.md
  if (nextStep <= 5) {
      await db.onboarding.create({
        data: {
          userId: user.id,
          step: nextStep,
          completed: false,
        },
      });
  }

  revalidatePath("/workspace");
  revalidatePath(`/workspace/[workspaceId]`, "layout"); // Revalidate broadly to ensure UI updates
}
