"use client";

import { useState } from "react";
import { Button, Alert, Modal } from "./ui";
import { cloneWorkspace } from "@/app/actions/workspace";
import { useRouter } from "next/navigation";

interface CloneWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export function CloneWorkspaceModal({
  isOpen,
  onClose,
  workspaceId,
}: CloneWorkspaceModalProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClone = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await cloneWorkspace(undefined, { workspaceId });

      if (result.errors?._form) {
        setError(result.errors._form[0]);
        setLoading(false);
        return;
      }

      if (result.success && result.newWorkspaceId) {
        router.push(`/workspace/${result.newWorkspaceId}/dashboard`);
      }
    } catch {
      setError("Erro ao clonar workspace. Tente novamente.");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Clonar workspace"
      description={`Será criado um novo workspace com o nome deste workspace seguido de " - clone", contendo cópias de todas as categorias, recorrências e transações. Convites e outros membros não serão copiados.`}
    >
      <div className="space-y-4">
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
          <Button type="button" onClick={handleClone} loading={loading}>
            Clonar workspace
          </Button>
        </div>
      </div>
    </Modal>
  );
}
