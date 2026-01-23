"use client";

import { useActionState, useState, useEffect } from "react";
import { Button, Alert, Modal } from "./ui";
import { removeUser } from "../actions/workspace";

interface RemoveUserModalProps {
    workspaceId: string;
    user: {
        id: string;
        name?: string | null;
        email: string;
    };
}

export function RemoveUserModal({ workspaceId, user }: RemoveUserModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, action, pending] = useActionState(removeUser, undefined);

    useEffect(() => {
        if (state?.message) {
            setIsOpen(false);
        }
    }, [state?.message]);

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                disabled={pending}
            >
                <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                </svg>
                Remover
            </Button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Remover Usuário"
                description={`Tem certeza que deseja remover ${user.name || user.email} do workspace?`}
            >
                <form action={action} className="space-y-4">
                    <input type="hidden" name="workspaceId" value={workspaceId} />
                    <input type="hidden" name="userId" value={user.id} />

                    {state?.errors?._form && (
                        <Alert variant="error">{state.errors._form[0]}</Alert>
                    )}


                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsOpen(false)}
                            disabled={pending}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" loading={pending} disabled={pending} variant="destructive">
                            Remover
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
