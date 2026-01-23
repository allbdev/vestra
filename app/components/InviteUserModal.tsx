
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Alert, Modal } from "./ui";
import { inviteUser } from "@/app/actions/workspace";

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
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Convidar Usuário"
      description="Envie um convite por e-mail para adicionar um usuário ao workspace"
    >
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
    </Modal>
  );
}

