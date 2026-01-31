"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Alert } from "@/app/components/ui";
import { BackgroundEffects } from "@/app/components/BackgroundEffects";
import { resetPassword } from "@/app/actions/password-recovery";

export default function ResetPasswordPage() {
    const [state, action, pending] = useActionState(resetPassword, undefined);
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();

    // Redirect to login after success
    useEffect(() => {
        if (state?.success) {
            const timer = setTimeout(() => {
                router.push("/login");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [state?.success, router]);

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
                <BackgroundEffects />
                <div className="w-full max-w-md relative z-10">
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl text-center">
                        <h1 className="text-xl font-bold mb-4 text-red-500">Link Inválido</h1>
                        <p className="text-muted mb-6">Token de recuperação não encontrado.</p>
                        <Link href="/forgot-password">
                            <Button fullWidth>Solicitar Nova Senha</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <BackgroundEffects />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Nova Senha</h1>
                    <p className="text-muted mt-2">Defina sua nova senha</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/20 animate-slide-up">
                    {state?.success ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Senha Redefinida!</h3>
                            <p className="text-muted mb-6">{state.message}</p>
                            <p className="text-sm text-muted mb-4">Você será redirecionado para o login em instantes...</p>
                            <Link href="/login">
                                <Button variant="secondary" fullWidth>
                                    Ir para o Login agora
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form action={action} className="flex flex-col gap-4">
                            <input type="hidden" name="token" value={token} />

                            <Input
                                label="Nova Senha"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                error={state?.errors?.password?.[0]}
                                required
                            />

                            <Input
                                label="Confirmar Nova Senha"
                                type="password"
                                name="password_confirmation"
                                placeholder="••••••••"
                                error={state?.errors?.password_confirmation?.[0]}
                                required
                            />

                            {state?.errors?._form && (
                                <Alert variant="error">{state.errors._form[0]}</Alert>
                            )}

                            <Button type="submit" loading={pending} fullWidth disabled={pending}>
                                {pending ? "Redefinindo..." : "Redefinir Senha"}
                            </Button>

                            <Link href="/login" className="block text-center mt-2">
                                <span className="text-sm text-muted hover:text-foreground transition-colors">
                                    Cancelar
                                </span>
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
