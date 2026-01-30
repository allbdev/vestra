import { getTransactions } from "@/app/actions/transactions";
import { getCategories } from "@/app/actions/categories";
import { verifySession } from "@/app/lib/session";
import { db } from "@/app/lib/db";
import { getDefaultDateRange } from "@/app/lib/date";
import TransactionsPageClient from "./TransactionsPageClient";
import { redirect } from "next/navigation";

export default async function TransactionsPage({
    params,
    searchParams,
}: {
    params: Promise<{ workspaceId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { workspaceId } = await params;
    const { startDate, endDate } = await searchParams;

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

    const transactions = await getTransactions(workspaceId, startStr, endStr);
    const categories = await getCategories(workspaceId);
    const isWorkspaceOwner = workspace.ownerId === user.id;

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

