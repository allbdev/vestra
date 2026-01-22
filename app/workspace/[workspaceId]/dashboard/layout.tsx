"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useWorkspace } from "@/app/contexts/WorkspaceContext";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui";
import { useEffect } from "react";
import { DashboardProvider } from "@/app/workspace/[workspaceId]/dashboard/contexts/DashboardContext";
import { AiOutlineRetweet } from "react-icons/ai";

export default function WorkspaceDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const { workspaces, changeWorkspace } = useWorkspace();
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;

  const currentWorkspace = workspaces.find((w) => w.id === workspaceId);
  const displayName = user?.name || user?.email || "Usuário";

  // Redirect to workspace list if workspace not found
  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspace) {
      router.push("/workspace");
    }
  }, [workspaces, currentWorkspace, router]);

  return (
    <DashboardProvider>
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
            <DashboardNavItem label="Visão Geral" active />
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
                    {currentWorkspace?.name || "Workspace"}
                  </p>
                  <Button variant="unstyled" size="sm" onClick={changeWorkspace}>
                      <AiOutlineRetweet className="w-4 h-4" />
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
                <Button variant="secondary" size="sm" onClick={logout}>
                  Sair
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}

interface DashboardNavItemProps {
  label: string;
  active?: boolean;
}

function DashboardNavItem({ label, active }: DashboardNavItemProps) {
  return (
    <button
      type="button"
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors text-sm ${
        active
          ? "bg-primary/10 text-foreground border border-primary/30"
          : "text-muted hover:text-foreground hover:bg-card-hover"
      }`}
    >
      <span>{label}</span>
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </button>
  );
}

