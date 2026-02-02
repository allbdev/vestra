import { redirect } from "next/navigation";
import { verifySession } from "@/app/lib/session";
import { getUserWorkspaces } from "@/app/lib/workspace-data";
import { DashboardLayoutClient } from "./DashboardLayoutClient";
import { getOnboardingStep } from "@/app/actions/onboarding";

export default async function WorkspaceDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const user = await verifySession();

  if (!user) {
    redirect("/login");
  }

  const { workspaceId } = await params;
  const workspaces = await getUserWorkspaces();
  const workspace = workspaces.find((w) => w.id === workspaceId) || null;
  const onboardingStep = await getOnboardingStep();

  return (
    <DashboardLayoutClient
      user={user}
      workspace={workspace}
      workspaces={workspaces}
      onboardingStep={onboardingStep}
    >
      {children}
    </DashboardLayoutClient>
  );
}

