
import { useState } from "react";
import { Button, Alert, Modal } from "./ui";
import { leaveWorkspace } from "@/app/actions/workspace";
import { useRouter } from "next/navigation";

interface LeaveWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    workspaceName: string;
}

export function LeaveWorkspaceModal({
    isOpen,
    onClose,
    workspaceId,
    workspaceName,
}: LeaveWorkspaceModalProps) {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLeave = async () => {
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("workspaceId", workspaceId);

        try {
            const result = await leaveWorkspace(undefined, formData);

            if (result.errors?._form) {
                setError(result.errors._form[0]);
                setLoading(false);
                return;
            }

            if (result.success) {
                router.refresh(); // Refresh to update list
                onClose();
            }
        } catch (err: any) {
            setError("Erro ao sair do workspace. Tente novamente.");
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
            title="Sair do Workspace"
            description={`Tem certeza que deseja sair do workspace "${workspaceName}"? Você perderá acesso a todos os dados.`}
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
                        onClick={handleLeave}
                        loading={loading}
                    >
                        Sair do Workspace
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
