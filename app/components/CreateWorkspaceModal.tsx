
import { useActionState } from "react";
import { Button, Input, Alert, Modal } from "./ui";
import { createWorkspace } from "../actions/workspace";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const [state, action, pending] = useActionState(createWorkspace, undefined);

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Criar Workspace"
      description="Crie um novo workspace para gerenciar suas finanças"
    >
      <form action={action} className="flex flex-col gap-4">
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
    </Modal>
  );
}

