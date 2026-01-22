"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Alert } from "@/app/components/ui";
import { useAuth } from "@/app/contexts/AuthContext";
import { InviteUserModal } from "@/app/components/InviteUserModal";
import { getStorageItem } from "@/app/lib/storage";

interface WorkspaceUser {
  id: string;
  name: string | null;
  email: string;
  isOwner: boolean;
  joinedAt: string;
}

export default function WorkspaceConfigPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { user, loading: authLoading } = useAuth();
  const [workspace, setWorkspace] = useState<any>(null);
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (user && workspaceId) {
      fetchWorkspaceData();
    }
  }, [user, workspaceId]);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      setError("");

      const sessionToken = getStorageItem("sessionToken");
      if (!sessionToken) {
        router.push("/login");
        return;
      }

      // Fetch workspace details
      const workspaceResponse = await fetch(
        `/api/workspaces/${workspaceId}`,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );

      if (!workspaceResponse.ok) {
        if (workspaceResponse.status === 404) {
          router.push("/404");
          return;
        }
        throw new Error("Erro ao carregar workspace");
      }

      const workspaceData = await workspaceResponse.json();
      setWorkspace(workspaceData.workspace);
      setIsOwner(workspaceData.workspace.isOwner);

      // Check if user is owner
      if (!workspaceData.workspace.isOwner) {
        router.push(`/workspace/${workspaceId}/dashboard`);
        return;
      }

      // Fetch users
      const usersResponse = await fetch(
        `/api/workspaces/${workspaceId}/users`,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );

      if (!usersResponse.ok) {
        throw new Error("Erro ao carregar usuários");
      }

      const usersData = await usersResponse.json();
      setUsers(usersData.users || []);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados do workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja remover este usuário do workspace?")) {
      return;
    }

    try {
      const sessionToken = getStorageItem("sessionToken");
      if (!sessionToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `/api/workspaces/${workspaceId}/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Erro ao remover usuário");
      }

      // Refresh users list
      fetchWorkspaceData();
    } catch (err: any) {
      setError(err.message || "Erro ao remover usuário");
    }
  };

  const handleInviteSent = () => {
    // Refresh users list after invite is sent
    fetchWorkspaceData();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Configurações do Workspace</h1>
            <p className="text-muted">
              {workspace?.name}
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

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Users List */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Usuários do Workspace</h2>

          {users.length === 0 ? (
            <p className="text-muted text-center py-8">
              Nenhum usuário encontrado
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((workspaceUser) => (
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUser(workspaceUser.id)}
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
        workspaceId={workspaceId}
        onInviteSent={handleInviteSent}
      />
    </div>
  );
}

