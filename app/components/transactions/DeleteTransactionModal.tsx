"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/app/components/ui";
import { Modal } from "@/app/components/ui/Modal";
import { deleteTransaction, TransactionActionState } from "@/app/actions/transactions";

interface DeleteTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactionId: string;
    workspaceId: string;
}

export function DeleteTransactionModal({
    isOpen,
    onClose,
    transactionId,
    workspaceId
}: DeleteTransactionModalProps) {
    const deleteAction = async (state: TransactionActionState | undefined, formData: FormData) => {
        return await deleteTransaction(workspaceId, transactionId, state, formData);
    };

    // Delete handling with useActionState
    const [deleteState, handleDeleteAction, deletePending] = useActionState(deleteAction, undefined);

    // Close delete modal on success
    useEffect(() => {
        if (deleteState?.success) {
            onClose();
        }
    }, [deleteState?.success, onClose]);

    return (
        <Modal
            title="Excluir Transação"
            description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
            isOpen={isOpen}
            onClose={onClose}
        >
            <form action={handleDeleteAction}>
                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={deletePending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="destructive"
                        disabled={deletePending}
                        loading={deletePending}
                    >
                        {deletePending ? "Excluindo..." : "Excluir"}
                    </Button>
                </div>
                {deleteState?.errors?._form && (
                    <div className="mt-2 text-sm text-red-500 text-right">
                        {deleteState.errors._form[0]}
                    </div>
                )}
            </form>
        </Modal>
    );
}
