import { redirect, notFound } from "next/navigation";
import { getWorkspaceConfigData } from "@/app/lib/workspace-config-data";
import { WorkspaceConfigClient } from "./WorkspaceConfigClient";

export default async function WorkspaceConfigPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const workspace = await getWorkspaceConfigData(workspaceId);

  if (!workspace) {
    notFound();
  }

  // If user is not owner, redirect to dashboard
  if (!workspace.isOwner) {
    redirect(`/workspace/${workspaceId}/dashboard`);
  }

  return <WorkspaceConfigClient workspace={workspace} />;
}

