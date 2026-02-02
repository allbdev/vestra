
import { useState } from "react";
import { Button, Input, Alert, Modal } from "./ui"; // Assuming Modal is exported from ./ui based on view_file
import { createWorkspace, WorkspaceFormState } from "../actions/workspace";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { workspaceSchema, WorkspaceFormData } from "@/app/lib/schemas";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const [formState, setFormState] = useState<WorkspaceFormState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
  } = useForm({
      resolver: yupResolver(workspaceSchema),
      defaultValues: {
          name: "",
      },
  });

  const onSubmit = async (data: WorkspaceFormData) => {
      setIsSubmitting(true);
      setFormState({});
      try {
          const result = await createWorkspace(undefined, data);
          setFormState(result);
          if (!result?.errors && !result?.limitReached) {
              onClose();
              reset();
          }
      } catch (error) {
          console.error(error);
          setFormState({ errors: { _form: ["Erro inesperado"] } });
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleCancel = () => {
    onClose();
    reset();
    setFormState({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Criar Workspace"
      description="Crie um novo workspace para gerenciar suas finanças"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nome do Workspace"
          placeholder="Ex: Finanças da Família"
          error={errors.name?.message || formState?.errors?.name?.[0]}
          autoFocus
          {...register("name")}
        />

        {formState?.errors?._form && (
          <Alert variant="error">{formState.errors._form[0]}</Alert>
        )}

        {formState?.limitReached && (
           <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
               <p className="font-semibold">Limite Atingido</p>
               <p>Você atingiu o limite de workspaces do seu plano.</p>
           </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            Criar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

