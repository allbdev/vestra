
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Alert, Modal } from "./ui";
import { updateWorkspaceName } from "@/app/actions/workspace";
import { useRouter } from "next/navigation";

interface EditWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    currentName: string;
}

import { yupResolver } from "@hookform/resolvers/yup";
import { workspaceSchema, WorkspaceFormData } from "@/app/lib/schemas";

interface EditWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    currentName: string;
}

export function EditWorkspaceModal({
    isOpen,
    onClose,
    workspaceId,
    currentName,
}: EditWorkspaceModalProps) {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<WorkspaceFormData>({
        resolver: yupResolver(workspaceSchema),
        defaultValues: {
            name: currentName,
        },
        mode: "onBlur",
    });

    const onSubmit = async (data: WorkspaceFormData) => {
        setLoading(true);
        setError("");

        try {
            const result = await updateWorkspaceName(undefined, { workspaceId, name: data.name });

            if (result.errors?._form) {
                setError(result.errors._form[0]);
                setLoading(false);
                return;
            }

            if (result.errors?.name) {
                // Manually set error to field if needed, or rely on formState errors if server returned field error
                // but since we validated locally, server errors might be specific
                // However, with yupResolver, generic errors are handled.
                // For simplicity, let's keep error state for server errors.
                setError(result.errors.name[0]);
                setLoading(false);
                return;
            }

            router.refresh();
            onClose();
        } catch (err: any) {
            setError("Erro ao atualizar workspace. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        reset({ name: currentName });
        setError("");
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            title="Editar Workspace"
            description="Alterar o nome do workspace"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Nome do Workspace"
                    type="text"
                    placeholder="Meu Workspace"
                    error={errors.name?.message}
                    required
                    autoFocus
                    {...register("name")}
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
                        Salvar
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
