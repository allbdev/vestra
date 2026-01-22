"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui";
import { useAuth } from "@/app/contexts/AuthContext";
import { useWorkspace } from "@/app/contexts/WorkspaceContext";
import { CreateWorkspaceModal } from "@/app/components/CreateWorkspaceModal";
import { useState } from "react";

export default function WorkspacePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { workspaces, loading: workspacesLoading, selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspace();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Redirect to saved workspace if exists
  useEffect(() => {
    if (!authLoading && !workspacesLoading && selectedWorkspaceId) {
      router.push(`/workspace/${selectedWorkspaceId}/dashboard`);
    }
  }, [selectedWorkspaceId, authLoading, workspacesLoading, router]);

  if (authLoading || workspacesLoading) {
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
    return null;
  }

  const handleWorkspaceClick = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    router.push(`/workspace/${workspaceId}/dashboard`);
  };

  const handleConfigClick = (e: React.MouseEvent, workspaceId: string) => {
    e.stopPropagation();
    router.push(`/workspace/${workspaceId}/config`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Workspaces</h1>
            <p className="text-muted">
              Selecione um workspace para gerenciar suas finanças
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Novo Workspace
          </Button>
        </div>

        {/* Workspaces Grid */}
        {workspaces.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum workspace encontrado</h3>
            <p className="text-muted mb-6">
              Crie seu primeiro workspace para começar a gerenciar suas finanças
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Criar Workspace
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <div
              role="button"
                key={workspace.id}
                onClick={() => handleWorkspaceClick(workspace.id)}
                className="bg-card border border-border rounded-2xl p-6 text-left hover:border-primary/50 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    {workspace.isOwner && (
                      <>
                        <button
                          onClick={(e) => handleConfigClick(e, workspace.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-card-hover transition-colors text-muted hover:text-foreground"
                          aria-label="Configurações"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </button>
                        <span className="px-2 py-1 text-xs font-medium rounded-lg bg-primary/10 text-primary">
                          Proprietário
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {workspace.name}
                </h3>
                <p className="text-sm text-muted mb-4">
                  Criado por {workspace.owner.name || workspace.owner.email}
                </p>
                {workspace._count && (
                  <div className="flex gap-4 text-sm text-muted">
                    <span>{workspace._count.categories || 0} categorias</span>
                    <span>{workspace._count.transactions || 0} transações</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <CreateWorkspaceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </div>
  );
}

