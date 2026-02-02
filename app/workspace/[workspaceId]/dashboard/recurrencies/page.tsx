import { getTransactionTemplates } from "@/app/actions/transaction-templates";
import { getCategories } from "@/app/actions/categories";
import { verifySession } from "@/app/lib/session";
import { db } from "@/app/lib/db";
import RecurrenciesPageClient from "./RecurrenciesPageClient";
import { redirect } from "next/navigation";
import { getOnboardingStep, completeOnboardingStep } from "@/app/actions/onboarding";

export default async function RecurrenciesPage({
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
    const templates = await getTransactionTemplates(workspaceId);

    const categories = await getCategories(workspaceId);
    const isWorkspaceOwner = workspace.ownerId === user.id;

    const onboardingStep = await getOnboardingStep();

    // Auto-complete onboarding step 4 if recurrences exist
    if (templates.length > 0 && onboardingStep?.step === 4 && !onboardingStep.completed) {
        await completeOnboardingStep(4, false);
    }

    return (
        <RecurrenciesPageClient
            templates={templates}
            categories={categories}
            workspaceId={workspaceId}
            currentUserId={user.id}
            isWorkspaceOwner={isWorkspaceOwner}
        />
    );
}

