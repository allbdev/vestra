import { verifySession } from "@/app/lib/session";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/app/actions/dashboard";
import { getCategories } from "@/app/actions/categories";
import { getTransactionTemplates } from "@/app/actions/transaction-templates";
import { DashboardPageClient } from "./DashboardPageClient";
import { FREQUENCY_TYPES } from "@/app/lib/consts";
import { getOnboardingStep } from "@/app/actions/onboarding";

function getDefaultDateRange() {
  const now = new Date();
  const year = now.getFullYear();
  const startDate = new Date(year, 0, 1); // Jan 1
  const endDate = new Date(year, 11, 31); // Dec 31

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const user = await verifySession();

  if (!user) {
    redirect("/login");
  }

  const { workspaceId } = await params;
  const defaultDates = getDefaultDateRange();
  const onboardingStep = await getOnboardingStep();

  const initialData = await getDashboardData(
    workspaceId,
    defaultDates.startDate,
    defaultDates.endDate,
    FREQUENCY_TYPES.MONTHLY
  );

  const [categories, transactionTemplates] = await Promise.all([
    getCategories(workspaceId),
    getTransactionTemplates(workspaceId),
  ]);

  return (
    <DashboardPageClient
      workspaceId={workspaceId}
      initialData={initialData}
      categories={categories}
      transactionTemplates={transactionTemplates}
      onboardingStep={onboardingStep}
    />
  );
}

