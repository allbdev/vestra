import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSessionToken } from "@/app/lib/session";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if this is an invite route (set by proxy)
  const headersList = await headers();
  const isInviteRoute = headersList.get("x-invite-route") === "true";

  // Skip authentication check for invite routes
  // Invite routes will handle their own authentication flow
  if (isInviteRoute) {
    return <>{children}</>;
  }

  // For all other workspace routes, check authentication
  const sessionToken = await getSessionToken();
  
  if (!sessionToken) {
    redirect("/login");
  }

  return <>{children}</>;
}

