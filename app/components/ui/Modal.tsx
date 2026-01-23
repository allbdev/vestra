"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    children: React.ReactNode;
    title: string;
    onClose: () => void;
    isOpen: boolean;
    description?: string;
}

export function Modal({
    children,
    title,
    onClose,
    isOpen,
    description,
}: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleCancel = () => {
        onClose();
    };

    if (!mounted || !isOpen) return null;

    return createPortal(
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

                <h2 className="text-2xl font-bold mb-2 pr-8">{title}</h2>
                {description && <p className="text-muted mb-6">{description}</p>}

                {children}
            </div>
        </div>,
        document.body
    );
}
