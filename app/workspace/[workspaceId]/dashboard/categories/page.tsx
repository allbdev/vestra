import { getCategories } from "@/app/actions/categories";
import { verifySession } from "@/app/lib/session";
import { db } from "@/app/lib/db";
import CategoriesPageClient from "./CategoriesPageClient";
import { redirect } from "next/navigation";
import { getOnboardingStep, completeOnboardingStep } from "@/app/actions/onboarding";

export default async function CategoriesPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    const user = await verifySession();

    if (!user) {
        redirect("/login");
    }

    const workspace = await db.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true }
    });

    if (!workspace) {
        redirect("/workspace");
    }
    const categories = await getCategories(workspaceId);
    
    const isWorkspaceOwner = workspace.ownerId === user.id;

    let onboardingStep = await getOnboardingStep();
    
    // Auto-complete onboarding step 3 if categories exist
    if (categories.length > 0 && onboardingStep?.step === 3 && !onboardingStep.completed) {
        await completeOnboardingStep(3, false);
        onboardingStep = await getOnboardingStep();
    }

    return (
        <CategoriesPageClient
            categories={categories}
            workspaceId={workspaceId}
            currentUserId={user.id}
            isWorkspaceOwner={isWorkspaceOwner}
        />
    );
}
