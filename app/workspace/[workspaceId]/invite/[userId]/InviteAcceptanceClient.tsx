"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Alert } from "@/app/components/ui";
import { useAuth } from "@/app/contexts/AuthContext";

interface InviteAcceptanceClientProps {
  invite: {
    id: string;
    workspaceId: string;
    userId: string;
    status: string;
    createdAt: string;
    workspace: {
      id: string;
      name: string;
      owner: {
        id: string;
        name: string | null;
        email: string;
      };
    };
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  sessionToken: string;
}

export function InviteAcceptanceClient({
  invite,
  sessionToken,
}: InviteAcceptanceClientProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update session token in storage and login (only once on mount)
  useEffect(() => {
    if (sessionToken) {
      login(sessionToken, {
        id: invite.user.id,
        name: invite.user.name,
        email: invite.user.email,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccept = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/workspaces/${invite.workspaceId}/invites/${invite.userId}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro ao aceitar convite. Tente novamente.");
        return;
      }

      // Redirect to workspace dashboard
      router.push(`/workspace/${invite.workspaceId}/dashboard`);
    } catch (err: any) {
      setError(err.message || "Erro ao aceitar convite. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/workspaces/${invite.workspaceId}/invites/${invite.userId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro ao recusar convite. Tente novamente.");
        return;
      }

      // Redirect to workspace list
      router.push("/workspace");
    } catch (err: any) {
      setError(err.message || "Erro ao recusar convite. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const ownerName = invite.workspace.owner.name || invite.workspace.owner.email;
  const inviteDate = new Date(invite.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Convite para Workspace</h1>
        </div>

        <div className="bg-card-hover rounded-xl p-6 mb-6">
          <p className="text-foreground text-center">
            <strong>{ownerName}</strong> (proprietário) convidou você para o
            workspace <strong>{invite.workspace.name}</strong> em{" "}
            <strong>{inviteDate}</strong>.
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleReject}
            disabled={loading}
          >
            Recusar
          </Button>
          <Button
            fullWidth
            onClick={handleAccept}
            loading={loading}
            disabled={loading}
          >
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  );
}

