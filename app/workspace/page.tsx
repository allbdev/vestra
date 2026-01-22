import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/app/lib/workspace-data";
import { verifySession } from "@/app/lib/session";
import { WorkspacePageClient } from "./WorkspacePageClient";

export default async function WorkspacePage() {
  const user = await verifySession();

  if (!user) {
    redirect("/login");
  }

  const workspaces = await getUserWorkspaces();

  return <WorkspacePageClient workspaces={workspaces} />;
}


