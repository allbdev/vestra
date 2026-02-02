import { getTransactions } from "@/app/actions/transactions";
import { getCategories } from "@/app/actions/categories";
import { verifySession } from "@/app/lib/session";
import { db } from "@/app/lib/db";
import { getDefaultDateRange } from "@/app/lib/date";
import TransactionsPageClient from "./TransactionsPageClient";
import { redirect } from "next/navigation";
import { getOnboardingStep, completeOnboardingStep } from "@/app/actions/onboarding";

export default async function TransactionsPage({
    params,
    searchParams,
}: {
    params: Promise<{ workspaceId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { workspaceId } = await params;
    const { startDate, endDate, categoryIds, type } = await searchParams;

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

    const defaultDates = getDefaultDateRange();
    const startStr = typeof startDate === 'string' ? startDate : defaultDates.startDate;
    const endStr = typeof endDate === 'string' ? endDate : defaultDates.endDate;

    const categoryIdsArr = typeof categoryIds === 'string'
        ? [categoryIds]
        : (Array.isArray(categoryIds) ? categoryIds : undefined);

    // Handle comma-separated list if it comes as a single string (common in some URL patterns)
    const normalizedCategoryIds = typeof categoryIds === 'string' && categoryIds.includes(',')
        ? categoryIds.split(',')
        : categoryIdsArr;

    const typeStr = typeof type === 'string' ? type : undefined;

    const transactions = await getTransactions(workspaceId, startStr, endStr, {
        categoryIds: normalizedCategoryIds,
        type: typeStr
    });
    const categories = await getCategories(workspaceId);
    const isWorkspaceOwner = workspace.ownerId === user.id;

    const onboardingStep = await getOnboardingStep();
    
    // Auto-complete onboarding step 5 if transactions exist
    if (transactions.length > 0 && onboardingStep?.step === 5 && !onboardingStep.completed) {
        await completeOnboardingStep(5, false);
    }

    return (
        <TransactionsPageClient
            transactions={transactions}
            categories={categories}
            workspaceId={workspaceId}
            currentUserId={user.id}
            isWorkspaceOwner={isWorkspaceOwner}
            defaultDateRange={{ startDate: startStr, endDate: endStr }}
        />
    );
}

