"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/ui";
import { useEffect, useState } from "react";
import { AiOutlineRetweet } from "react-icons/ai";
import { logout } from "@/app/actions/auth";
import type { AuthenticatedUser } from "@/app/lib/auth";
import type { WorkspaceData } from "@/app/lib/workspace-data";
import { LuMenu, LuX, LuLogOut, LuUser } from "react-icons/lu";

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
  const pathname = usePathname();
  const displayName = user?.name || user?.email || "Usuário";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect to workspace list if workspace not found
  useEffect(() => {
    if (workspaces.length > 0 && !workspace) {
      router.push("/workspace");
    }
  }, [workspaces, workspace, router]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      // Clean up style on unmount
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);


  const handleChangeWorkspace = () => {
    router.push("/workspace");
  };

  const handleLogout = async () => {
    await logout();
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {!isMobile && (
        <div className="h-16 flex items-center px-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold">Vestra</span>
          </div>
        </div>
      )}

      {workspace && (
        <div className="px-6 py-6 border-b border-border md:hidden">
          <div className="flex items-center justify-between gap-2 mb-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Workspace
            </p>
            <Button variant="secondary" size="sm" onClick={handleChangeWorkspace}>
              Trocar
            </Button>
          </div>
          <div className="font-bold text-xl">{workspace.name}</div>
        </div>
      )}

      {user && (
        <div className="px-6 py-6 border-b border-border md:hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {user.name?.charAt(0).toUpperCase() || <LuUser />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{user.name}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-6 space-y-1 text-sm overflow-y-auto">
        <DashboardNavItem
          label="Visão Geral"
          href={workspace ? `/workspace/${workspace.id}/dashboard` : "#"}
          active={pathname === (workspace ? `/workspace/${workspace.id}/dashboard` : "")}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <DashboardNavItem
          label="Categorias"
          href={workspace ? `/workspace/${workspace.id}/dashboard/categories` : "#"}
          active={pathname === (workspace ? `/workspace/${workspace.id}/dashboard/categories` : "")}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <DashboardNavItem
          label="Recorrências"
          href={workspace ? `/workspace/${workspace.id}/dashboard/recurrencies` : "#"}
          active={pathname === (workspace ? `/workspace/${workspace.id}/dashboard/recurrencies` : "")}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <DashboardNavItem
          label="Transações"
          href={workspace ? `/workspace/${workspace.id}/dashboard/transactions` : "#"}
          active={pathname === (workspace ? `/workspace/${workspace.id}/dashboard/transactions` : "")}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      </nav>

      <div className="p-4 border-t border-border mt-auto md:hidden">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-destructive hover:text-destructive/80 font-medium w-full p-2"
        >
          <LuLogOut className="w-5 h-5" />
          Sair da conta
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="h-screen w-full bg-background text-foreground flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/60 backdrop-blur-lg flex-shrink-0">
          <SidebarContent />
        </aside>

        {/* Main content wrapper */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <header className="h-16 flex-shrink-0 border-b border-border bg-background/80 backdrop-blur-lg px-4 sm:px-6 flex items-center justify-between">
            {/* Mobile: Logo Left, Menu Right (Wait, requirement: Logo Left, Icon Aside Right) */}
            {/* Req: "The header should have only the Vestra logo/title at the left and a icon to open the aside on the right." */}

            <div className="flex items-center gap-3 md:hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold">Vestra</span>
            </div>

            {/* Desktop Header Content (hidden on mobile? No, req says "The header should have only...") */}
            {/* If Mobile: Logo + Menu Button. Desktop: Retweet + User Info */}
            <div className="flex-1 flex items-center justify-end md:justify-between gap-4">
              {/* Right side Toggle for Mobile */}
              <button
                className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <LuMenu className="w-7 h-7" />
              </button>

              {/* Desktop Header Content */}
              <div className="hidden md:flex items-center gap-2">
                <p className="text-xs text-muted uppercase tracking-wide">
                  {workspace?.name || "Workspace"}
                </p>
                <Button variant="unstyled" size="sm" onClick={handleChangeWorkspace}>
                  <AiOutlineRetweet className="!size-4" />
                </Button>
              </div>

              <div className="hidden md:flex items-center gap-4">
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
                <button
                  onClick={handleLogout}
                  className="text-muted hover:text-destructive transition-colors p-2"
                  title="Sair"
                >
                  <LuLogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Main Scrollable Content */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-background z-50 md:hidden transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-between px-6 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold">Vestra</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <LuX className="w-7 h-7" />
            </button>
          </div>

          <SidebarContent isMobile={true} />
        </div>
      </div>
    </>
  );
}

interface DashboardNavItemProps {
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}

function DashboardNavItem({ label, active, href, onClick }: DashboardNavItemProps) {
  const className = `w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors text-sm ${active
    ? "bg-primary/10 text-foreground border border-primary/30"
    : "text-muted hover:text-foreground hover:bg-card-hover"
    }`;

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
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
      onClick={onClick}
    >
      <span>{label}</span>
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </button>
  );
}
