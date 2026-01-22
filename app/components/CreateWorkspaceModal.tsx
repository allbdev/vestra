"use client";

import { useActionState } from "react";
import { Button, Input, Alert } from "./ui";
import { createWorkspace } from "../actions/workspace";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const [state, action, pending] = useActionState(createWorkspace, undefined);

  if (!isOpen) return null;

  const handleCancel = () => {
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

        <form action={action} className="space-y-4">
          <Input
            label="Nome do Workspace"
            name="name"
            placeholder="Ex: Finanças da Família"
            error={state?.errors?.name?.[0]}
            required
            autoFocus
          />

          {state?.errors?.name && (
            <Alert variant="error">{state.errors.name[0]}</Alert>
          )}
          {state?.errors?._form && (
            <Alert variant="error">{state.errors._form[0]}</Alert>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={pending} disabled={pending}>
              Criar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

