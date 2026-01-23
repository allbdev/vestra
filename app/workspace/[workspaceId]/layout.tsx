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

    const workspace = await getWorkspace(workspaceId);

    if (!workspace) {
        redirect("/workspace");
    }

    return <>{children}</>;
}
