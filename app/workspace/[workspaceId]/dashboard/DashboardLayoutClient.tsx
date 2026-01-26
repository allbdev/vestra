"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/ui";
import { useEffect } from "react";
import { AiOutlineRetweet } from "react-icons/ai";
import { logout } from "@/app/actions/auth";
import type { AuthenticatedUser } from "@/app/lib/auth";
import type { WorkspaceData } from "@/app/lib/workspace-data";

interface DashboardLayoutClientProps {
  user: AuthenticatedUser;
  workspace: WorkspaceData | null;
  workspaces: WorkspaceData[];
  children: React.ReactNode;
}

export function DashboardLayoutClient({
  user,
  workspace,
  workspaces,
  children,
}: DashboardLayoutClientProps) {
  const router = useRouter();
  const displayName = user?.name || user?.email || "Usuário";

  // Redirect to workspace list if workspace not found
  useEffect(() => {
    if (workspaces.length > 0 && !workspace) {
      router.push("/workspace");
    }
  }, [workspaces, workspace, router]);

  const handleChangeWorkspace = () => {
    router.push("/workspace");
  };

  return (
    <>
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/60 backdrop-blur-lg">
          <div className="h-16 flex items-center px-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold">Vestra</span>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
            <DashboardNavItem label="Visão Geral" href={workspace ? `/workspace/${workspace.id}/dashboard` : "#"} active={false} />
            <DashboardNavItem label="Categorias" href={workspace ? `/workspace/${workspace.id}/dashboard/categories` : "#"} active={false} />
            <DashboardNavItem label="Recorrências" href={workspace ? `/workspace/${workspace.id}/dashboard/recurrencies` : "#"} active={false} />
            <DashboardNavItem label="Transações" />
            <DashboardNavItem label="Orçamentos" />
            <DashboardNavItem label="Relatórios" />
            <DashboardNavItem label="Configurações" />
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/80 backdrop-blur-lg px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3 md:hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold">Vestra</span>
            </div>

            <div className="flex-1 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted uppercase tracking-wide">
                    {workspace?.name || "Workspace"}
                  </p>
                  <Button variant="unstyled" size="sm" onClick={handleChangeWorkspace}>
                    <AiOutlineRetweet className="!size-4" />
                  </Button>
                </div>
                <h1 className="text-lg font-semibold">Olá, {displayName}</h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{displayName}</p>
                    {user?.email && (
                      <p className="text-xs text-muted truncate max-w-[180px]">{user.email}</p>
                    )}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-sm font-semibold text-muted">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <form action={logout}>
                  <Button variant="secondary" size="sm" type="submit">
                    Sair
                  </Button>
                </form>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

interface DashboardNavItemProps {
  label: string;
  active?: boolean;
  href?: string;
}

function DashboardNavItem({ label, active, href }: DashboardNavItemProps) {
  const className = `w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors text-sm ${active
    ? "bg-primary/10 text-foreground border border-primary/30"
    : "text-muted hover:text-foreground hover:bg-card-hover"
    }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        <span>{label}</span>
        {active && (
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
    >
      <span>{label}</span>
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </button>
  );
}

