"use client";

import { useState } from "react";
import { Button, Alert } from "@/app/components/ui";
import { InviteUserModal } from "@/app/components/InviteUserModal";
import { removeUser } from "@/app/actions/workspace";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import type { WorkspaceConfigData } from "@/app/lib/workspace-config-data";
import { Title } from "@/app/components/Title";

interface WorkspaceConfigClientProps {
  workspace: WorkspaceConfigData;
}

export function WorkspaceConfigClient({ workspace }: WorkspaceConfigClientProps) {
  const router = useRouter();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [removeState, removeAction, removePending] = useActionState(removeUser, undefined);


  const handleInviteSent = () => {
    // Refresh the page to show updated user list
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Title>Configurações do Workspace</Title>
            <p className="text-muted">
              {workspace.name}
            </p>
          </div>
          <Button onClick={() => setIsInviteModalOpen(true)}>
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
            Convidar Usuário
          </Button>
        </div>

        {removeState?.errors?._form && (
          <Alert variant="error" className="mb-6">
            {removeState.errors._form[0]}
          </Alert>
        )}

        {removeState?.message && (
          <Alert className="mb-6">
            {removeState.message}
          </Alert>
        )}

        {/* Users List */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Usuários do Workspace</h2>

          {workspace.users.length === 0 ? (
            <p className="text-muted text-center py-8">
              Nenhum usuário encontrado
            </p>
          ) : (
            <div className="space-y-3">
              {workspace.users.map((workspaceUser) => (
                <div
                  key={workspaceUser.id}
                  className="flex items-center justify-between p-4 bg-card-hover rounded-xl border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                      {(workspaceUser.name || workspaceUser.email)
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">
                        {workspaceUser.name || workspaceUser.email}
                      </p>
                      <p className="text-sm text-muted">{workspaceUser.email}</p>
                      {workspaceUser.isOwner && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-lg bg-primary/10 text-primary">
                          Proprietário
                        </span>
                      )}
                    </div>
                  </div>
                  {!workspaceUser.isOwner && (
                    <form action={removeAction}>
                      <input type="hidden" name="workspaceId" value={workspace.id} />
                      <input type="hidden" name="userId" value={workspaceUser.id} />
                      <Button
                        variant="ghost"
                        size="sm"
                        type="submit"
                        disabled={removePending}
                        onClick={(e) => {
                          if (!confirm("Tem certeza que deseja remover este usuário do workspace?")) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Remover
                      </Button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={workspace.id}
        onInviteSent={handleInviteSent}
      />
    </div>
  );
}

