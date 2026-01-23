
import { useState } from "react";
import { Button, Alert, Modal } from "./ui";
import { deleteWorkspace } from "@/app/actions/workspace";
import { useRouter } from "next/navigation";

interface DeleteWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
}

export function DeleteWorkspaceModal({
    isOpen,
    onClose,
    workspaceId,
}: DeleteWorkspaceModalProps) {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("workspaceId", workspaceId);

        try {
            const result = await deleteWorkspace(undefined, formData);

            if (result.errors?._form) {
                setError(result.errors._form[0]);
                setLoading(false);
                return;
            }

            if (result.success) {
                router.push("/workspace");
                // No need to close modal or stop loading as we are navigating away
            }
        } catch (err: any) {
            setError("Erro ao excluir workspace. Tente novamente.");
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
            title="Excluir Workspace"
            description="Tem certeza que deseja excluir este workspace? Esta ação não pode ser desfeita e todos os dados serão perdidos."
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
                    <Button
                        type="button"
                        className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 hover:shadow-red-600/30 border-none"
                        onClick={handleDelete}
                        loading={loading}
                    >
                        Excluir Workspace
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
