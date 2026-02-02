"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui";
import { CreateWorkspaceModal } from "@/app/components/CreateWorkspaceModal";
import { LeaveWorkspaceModal } from "@/app/components/LeaveWorkspaceModal";
import { useState } from "react";
import type { WorkspaceData } from "@/app/lib/workspace-data";
import { setSessionSelectedWorkspaceId } from "../actions/workspace";
import { Title } from "../components/Title";
import { FiLogOut } from "react-icons/fi";
import { GoGear, GoPlus } from "react-icons/go";
import { FaRegBuilding } from "react-icons/fa";

import { TourWrapper } from "@/app/components/common/TourWrapper";
import { completeOnboardingStep } from "@/app/actions/onboarding";

interface WorkspacePageClientProps {
  workspaces: WorkspaceData[];
  onboardingStep: { step: number; completed: boolean } | null;
}

export function WorkspacePageClient({ workspaces, onboardingStep }: WorkspacePageClientProps) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [leaveModalData, setLeaveModalData] = useState<{ isOpen: boolean; workspaceId: string; workspaceName: string } | null>(null);
  const [isTourClosed, setIsTourClosed] = useState(false);

  // Tour logic for Step 1
  const showTour = onboardingStep?.step === 1 && !onboardingStep.completed && !isTourClosed;

  const handleTourAction = async () => {
    // Open create workspace modal
    setIsCreateModalOpen(true);
    // Mark step 1 as completed
    await completeOnboardingStep(1);
  };
  
  // ... (handlers)

  const handleWorkspaceClick = (workspaceId: string) => {
    setSessionSelectedWorkspaceId(workspaceId);
    router.push(`/workspace/${workspaceId}/dashboard`);
  };

  const handleConfigClick = (e: React.MouseEvent, workspaceId: string) => {
    e.stopPropagation();
    router.push(`/workspace/${workspaceId}/config`);
  };

  const handleLeaveClick = (e: React.MouseEvent, workspaceId: string, workspaceName: string) => {
    e.stopPropagation();
    setLeaveModalData({ isOpen: true, workspaceId, workspaceName });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Title>Workspaces</Title>
            <p className="text-muted">
              Selecione um workspace para gerenciar suas finanças
            </p>
          </div>
          <TourWrapper
            show={showTour}
            onClose={() => setIsTourClosed(true)}
            title="Crie seu workspace para começar a organizar suas finanças"
            subtitle="As suas transações são relaticas ao seu workspace. Você pode criar workspaces para diferentes propósitos, como finanças pessoais, finanças da empresa, etc."
            actionLabel="Criar Workspace"
            onAction={handleTourAction}
            placement="bottom"
          >
            {(ref) => (
              <Button ref={ref} onClick={() => setIsCreateModalOpen(true)}>
                <div className="flex items-center gap-2">
                  <GoPlus />
                  Novo Workspace
                </div>
              </Button>
            )}
          </TourWrapper>
        </div>

        {/* ... (rest of the component) ... */}

        {/* Workspaces Grid */}
        {workspaces.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FaRegBuilding className="text-primary" />
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
                    <FaRegBuilding className="text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    {workspace.isOwner ? (
                      <>
                        <button
                          onClick={(e) => handleConfigClick(e, workspace.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-card-hover transition-colors text-muted hover:text-foreground"
                          aria-label="Configurações"
                        >
                          <GoGear />
                        </button>
                        <span className="px-2 py-1 text-xs font-medium rounded-lg bg-primary/10 text-primary">
                          Proprietário
                        </span>
                      </>
                    ) : (
                      <button
                        onClick={(e) => handleLeaveClick(e, workspace.id, workspace.name)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-card-hover transition-colors text-muted hover:text-red-500"
                        aria-label="Sair do workspace"
                        title="Sair do workspace"
                      >
                        <FiLogOut className="w-5 h-5" />
                      </button>
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

        {leaveModalData && (
          <LeaveWorkspaceModal
            isOpen={leaveModalData.isOpen}
            onClose={() => setLeaveModalData(null)}
            workspaceId={leaveModalData.workspaceId}
            workspaceName={leaveModalData.workspaceName}
          />
        )}
      </div>
    </div>
  );
}
