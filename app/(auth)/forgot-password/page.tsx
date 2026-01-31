"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Input, Alert } from "@/app/components/ui";
import { BackgroundEffects } from "@/app/components/BackgroundEffects";
import { requestPasswordReset } from "@/app/actions/password-recovery";

export default function ForgotPasswordPage() {
    const [state, action, pending] = useActionState(requestPasswordReset, undefined);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <BackgroundEffects />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 19.464a3 3 0 01-.879.586l-1.637.763a1 1 0 01-1.371-1.29l1.414-2.828-1.586-1.586-1.586-1.586a6 6 0 018.107-6.521z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Recuperar Senha</h1>
                    <p className="text-muted mt-2">Digite seu e-mail para receber um link de redefinição</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/20 animate-slide-up">
                    {state?.success ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Verifique seu e-mail</h3>
                            <p className="text-muted mb-6">{state.message}</p>
                            <Link href="/login">
                                <Button variant="secondary" fullWidth>
                                    Voltar para o Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form action={action} className="flex flex-col gap-4">
                            <Input
                                label="E-mail"
                                type="email"
                                name="email"
                                placeholder="joao@exemplo.com"
                                error={state?.errors?.email?.[0]}
                                required
                            />

                            {state?.errors?._form && (
                                <Alert variant="error">{state.errors._form[0]}</Alert>
                            )}

                            <Button type="submit" loading={pending} fullWidth disabled={pending}>
                                {pending ? "Enviando..." : "Enviar Link"}
                            </Button>

                            <Link href="/login" className="block text-center mt-2">
                                <span className="text-sm text-muted hover:text-foreground transition-colors">
                                    Voltar para o Login
                                </span>
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
