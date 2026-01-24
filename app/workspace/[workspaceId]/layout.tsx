import { redirect } from "next/navigation";
import { getWorkspace } from "@/app/lib/workspace-data";

export default async function WorkspaceIdLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;

    // Check if this is an invite route (set by proxy)
    const headersList = await import("next/headers").then(h => h.headers());
    const isInviteRoute = headersList.get("x-invite-route") === "true";

    if (isInviteRoute) {
        return <>{children}</>;
    }

    const workspace = await getWorkspace(workspaceId);

    if (!workspace) {
        redirect("/workspace");
    }

    return <>{children}</>;
}
