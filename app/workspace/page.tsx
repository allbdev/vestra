import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/app/lib/workspace-data";
import { verifySession } from "@/app/lib/session";
import { WorkspacePageClient } from "./WorkspacePageClient";

import { getOnboardingStep } from "@/app/actions/onboarding";

export default async function WorkspacePage() {
  const user = await verifySession();

  if (!user) {
    redirect("/login");
  }

  const workspaces = await getUserWorkspaces();
  const onboardingStep = await getOnboardingStep();

  return <WorkspacePageClient workspaces={workspaces} onboardingStep={onboardingStep} />;
}


