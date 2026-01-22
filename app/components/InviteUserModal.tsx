"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Alert } from "./ui";
import { inviteUser } from "@/app/actions/workspace";
import { useRouter } from "next/navigation";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onInviteSent: () => void;
}

interface InviteUserFormData {
  email: string;
}

export function InviteUserModal({
  isOpen,
  onClose,
  workspaceId,
  onInviteSent,
}: InviteUserModalProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteUserFormData>({
    mode: "onBlur",
  });

  if (!isOpen) return null;

  const onSubmit = async (data: InviteUserFormData) => {
    setLoading(true);
    setError("");

    try {
      const result = await inviteUser(workspaceId, data.email.trim().toLowerCase());

      if (!result.success) {
        setError(result.error || "Erro ao enviar convite. Tente novamente.");
        setLoading(false);
        return;
      }

      reset();
      onInviteSent();
      onClose();
      // Refresh the page to show updated data
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao enviar convite. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-card-hover transition-colors text-muted hover:text-foreground"
          aria-label="Fechar"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-2 pr-8">Convidar Usuário</h2>
        <p className="text-muted mb-6">
          Envie um convite por e-mail para adicionar um usuário ao workspace
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="usuario@exemplo.com"
            error={errors.email?.message}
            required
            autoFocus
            {...register("email", {
              required: "E-mail é obrigatório",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Formato de e-mail inválido",
              },
            })}
          />

          {error && <Alert variant="error">{error}</Alert>}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Enviar Convite
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

