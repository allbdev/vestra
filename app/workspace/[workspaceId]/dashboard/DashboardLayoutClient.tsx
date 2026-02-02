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
import { Logo } from "@/app/components/Logo";
import { useMediaQuery } from "@mui/material";

import { TourWrapper } from "@/app/components/common/TourWrapper";
import React, { forwardRef } from "react";

interface DashboardLayoutClientProps {
  user: AuthenticatedUser;
  workspace: WorkspaceData | null;
  workspaces: WorkspaceData[];
  onboardingStep: { step: number; completed: boolean } | null;
  children: React.ReactNode;
}

interface SidebarContentProps {
  isMobile?: boolean;
  user: AuthenticatedUser;
  workspace: WorkspaceData | null;
  pathname: string;
  setIsMobileMenuOpen: (open: boolean) => void;
  handleChangeWorkspace: () => void;
  handleLogout: () => void;
  // Tour Props
  currentStep: number | null;
  handleTourAction: (step: number, path: string) => void;
  handleTourClose: () => void;
}

function SidebarContent({
  isMobile = false,
  user,
  workspace,
  pathname,
  setIsMobileMenuOpen,
  handleChangeWorkspace,
  handleLogout,
  currentStep,
  handleTourAction,
  handleTourClose
}: SidebarContentProps) {
  
  return (
    <>
      {!isMobile && (
        <div className="h-16 flex items-center px-6 border-b border-border flex-shrink-0">
          <Logo iconSize={9} textSize="text-lg" />
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
        
        {/* Step 3: Categories */}
        <TourWrapper<HTMLAnchorElement | HTMLButtonElement>
            show={currentStep === 3 && !!workspace}
            onClose={handleTourClose}
            title="Crie sua primeira categoria"
            subtitle="As suas categorias são utilizadas para identificar e organizar suas transações."
            actionLabel="Ir para Categorias"
            onAction={() => workspace && handleTourAction(3, `/workspace/${workspace.id}/dashboard/categories`)}
            placement="right"
        >
            {(ref) => (
                <DashboardNavItem
                    ref={ref}
                    label="Categorias"
                    href={workspace ? `/workspace/${workspace.id}/dashboard/categories` : "#"}
                    active={pathname === (workspace ? `/workspace/${workspace.id}/dashboard/categories` : "")}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </TourWrapper>

        {/* Step 4: Recurrences */}
        <TourWrapper<HTMLAnchorElement | HTMLButtonElement>
            show={currentStep === 4 && !!workspace}
            onClose={handleTourClose}
            title="Crie sua primeira recorrencia"
            subtitle="As suas recorrencias são utilizadas para cadastrar transações que se repetem periodicamente."
            actionLabel="Ir para Recorrências"
            onAction={() => workspace && handleTourAction(4, `/workspace/${workspace.id}/dashboard/recurrencies`)}
            placement="right"
        >
            {(ref) => (
                <DashboardNavItem
                    ref={ref}
                    label="Recorrências"
                    href={workspace ? `/workspace/${workspace.id}/dashboard/recurrencies` : "#"}
                    active={pathname === (workspace ? `/workspace/${workspace.id}/dashboard/recurrencies` : "")}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </TourWrapper>

        {/* Step 5: Transactions */}
        <TourWrapper<HTMLAnchorElement | HTMLButtonElement>
            show={currentStep === 5 && !!workspace}
            onClose={handleTourClose}
            title="Confira suas transações"
            subtitle="As suas transações são relaticas ao seu workspace. Você pode criar workspaces para diferentes propósitos, como finanças pessoais, finanças da empresa, etc."
            actionLabel="Ir para Transações"
            onAction={() => workspace && handleTourAction(5, `/workspace/${workspace.id}/dashboard/transactions`)}
            placement="right"
        >
            {(ref) => (
                <DashboardNavItem
                    ref={ref}
                    label="Transações"
                    href={workspace ? `/workspace/${workspace.id}/dashboard/transactions` : "#"}
                    active={pathname === (workspace ? `/workspace/${workspace.id}/dashboard/transactions` : "")}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </TourWrapper>
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
}

export function DashboardLayoutClient({
  user,
  workspace,
  workspaces,
  onboardingStep,
  children,
}: DashboardLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const displayName = user?.name || user?.email || "Usuário";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTourClosed, setIsTourClosed] = useState(false);
  
  // Reset tour closed state when step changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTourClosed(prev => prev ? false : prev);
  }, [onboardingStep?.step]);
  
  // Use MUI media query or similar to detect desktop
  // Note: Tailwind md is 768px
  const isDesktop = useMediaQuery("(min-width:768px)");

  // Tour Logic
  console.log("DashboardLayoutClient Tour Debug:", { onboardingStep, isTourClosed, workspaceId: workspace?.id });
  const currentStep = (onboardingStep?.completed || isTourClosed) ? null : onboardingStep?.step;

  const handleTourAction = async (step: number, redirectPath: string) => {
    if (!workspace) return;
    setIsTourClosed(true);
    router.push(redirectPath);
  };
  
  const handleTourClose = () => {
    setIsTourClosed(true);
  };

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

  return (
    <>
      <div className="h-screen w-full bg-background text-foreground flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/60 backdrop-blur-lg flex-shrink-0">
          <SidebarContent
            isMobile={false}
            user={user}
            workspace={workspace}
            pathname={pathname}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            handleChangeWorkspace={handleChangeWorkspace}
            handleLogout={handleLogout}
            currentStep={isDesktop ? (currentStep || null) : null}
            handleTourAction={handleTourAction}
            handleTourClose={handleTourClose}
          />
        </aside>

        {/* Main content wrapper */}
         <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <header className="h-16 flex-shrink-0 border-b border-border bg-background/80 backdrop-blur-lg px-4 sm:px-6 flex items-center justify-between">
            {/* Mobile: Logo Left, Menu Right (Wait, requirement: Logo Left, Icon Aside Right) */}
            {/* Req: "The header should have only the Vestra logo/title at the left and a icon to open the aside on the right." */}

            <Logo className="md:hidden" iconSize={9} textSize="text-lg" />

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
            <Logo iconSize={9} textSize="text-lg" />
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <LuX className="w-7 h-7" />
            </button>
          </div>

          <SidebarContent
            isMobile={true}
            user={user}
            workspace={workspace}
            pathname={pathname}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            handleChangeWorkspace={handleChangeWorkspace}
            handleLogout={handleLogout}
            currentStep={!isDesktop ? (currentStep || null) : null}
            handleTourAction={handleTourAction}
            handleTourClose={handleTourClose}
          />
        </div>
      </div>
    </>
  );
}

// Update DashboardNavItem to forward ref
interface DashboardNavItemProps {
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}

const DashboardNavItem = forwardRef<HTMLAnchorElement | HTMLButtonElement, DashboardNavItemProps>(({ label, active, href, onClick }, ref) => {
   const className = `w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors text-sm ${active
    ? "bg-primary/10 text-foreground border border-primary/30"
    : "text-muted hover:text-foreground hover:bg-card-hover"
    }`;

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick} ref={ref as React.Ref<HTMLAnchorElement>}>
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
      ref={ref as React.Ref<HTMLButtonElement>}
    >
      <span>{label}</span>
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </button>
  );
});

DashboardNavItem.displayName = "DashboardNavItem";
