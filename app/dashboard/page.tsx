"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { Button } from "@/app/components/ui";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const displayName = user?.name || user?.email || "Usuário";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect handled by useEffect in AuthContext or middleware
    return null;
  }

  return (
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
              <p className="text-xs text-muted uppercase tracking-wide">Painel</p>
              <h1 className="text-lg font-semibold">Olá, {displayName}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{displayName}</p>
                  {user.email && (
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
          <section className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-2">Bem-vindo ao seu painel</h2>
            <p className="text-muted mb-4">
              Esta é apenas uma tela de exemplo (hello world). Em breve você verá aqui um resumo das suas finanças.
            </p>
            <pre className="bg-background border border-border rounded-xl p-4 text-xs text-muted overflow-x-auto">
              <code>console.log("Hello, Vestra dashboard!");</code>
            </pre>
          </section>

          {/* Placeholder for future widgets */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="h-32 bg-card border border-dashed border-border/70 rounded-2xl flex items-center justify-center text-muted text-sm">
              Card de saldo / resumo (em breve)
            </div>
            <div className="h-32 bg-card border border-dashed border-border/70 rounded-2xl flex items-center justify-center text-muted text-sm">
              Gráfico de gastos (em breve)
            </div>
            <div className="h-32 bg-card border border-dashed border-border/70 rounded-2xl flex items-center justify-center text-muted text-sm">
              Lista de próximas contas (em breve)
            </div>
          </section>
        </main>
      </div>
    </div>
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
