"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Alert } from "./ui";
import { useWorkspace } from "../contexts/WorkspaceContext";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateWorkspaceFormData {
  name: string;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const { createWorkspace } = useWorkspace();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateWorkspaceFormData>({
    mode: "onBlur",
  });

  if (!isOpen) return null;

  const onSubmit = async (data: CreateWorkspaceFormData) => {
    setLoading(true);
    setError("");

    try {
      const workspace = await createWorkspace(data.name.trim());
      if (workspace) {
        reset();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar workspace. Tente novamente.");
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

        <h2 className="text-2xl font-bold mb-2 pr-8">Criar Workspace</h2>
        <p className="text-muted mb-6">
          Crie um novo workspace para gerenciar suas finanças
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome do Workspace"
            placeholder="Ex: Finanças da Família"
            error={errors.name?.message}
            required
            autoFocus
            {...register("name", {
              required: "Nome do workspace é obrigatório",
              minLength: {
                value: 2,
                message: "Nome deve ter pelo menos 2 caracteres",
              },
              maxLength: {
                value: 255,
                message: "Nome deve ter no máximo 255 caracteres",
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
              Criar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

