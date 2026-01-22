"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Button, Input, CodeInput, Alert } from "@/app/components/ui";
import { Step } from "./domain";
import { BackgroundEffects } from "@/app/components/BackgroundEffects";
import { register, confirm } from "@/app/actions/auth";

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("register");
  const [confirmationCode, setConfirmationCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const [registerState, registerAction, registerPending] = useActionState(register, undefined);
  const [confirmState, confirmAction, confirmPending] = useActionState(confirm, undefined);

  // Move to confirm step when registration succeeds
  useEffect(() => {
    if (registerState?.message && !registerState?.errors) {
      setStep("confirm");
    }
  }, [registerState]);

  // Show success when confirmation succeeds
  useEffect(() => {
    if (confirmState?.success) {
      setSuccess(true);
    }
  }, [confirmState]);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <BackgroundEffects />
        <div className="w-full max-w-md animate-slide-up">
          <div className="bg-card border border-border rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Conta Criada!</h2>
              <p className="text-muted mb-6">Sua conta foi criada com sucesso. Agora você pode entrar.</p>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary-hover text-background font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary/20"
              >
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundEffects />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Vestra</h1>
          <p className="text-muted mt-2">Controle suas finanças</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/20 animate-slide-up">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className={`flex items-center gap-2 ${step === "register" ? "text-foreground" : "text-muted"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step === "register" ? "bg-primary text-background" : "bg-primary/20 text-primary"
              }`}>
                {step === "confirm" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : "1"}
              </div>
              <span className="text-sm font-medium hidden sm:inline">Dados</span>
            </div>
            <div className={`w-12 h-0.5 rounded ${step === "confirm" ? "bg-primary" : "bg-border"}`} />
            <div className={`flex items-center gap-2 ${step === "confirm" ? "text-foreground" : "text-muted"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step === "confirm" ? "bg-primary text-background" : "bg-card-hover border border-border"
              }`}>
                2
              </div>
              <span className="text-sm font-medium hidden sm:inline">Verificar</span>
            </div>
          </div>

          {step === "register" ? (
            <form action={registerAction} className="space-y-5">
              <Input
                label="Nome Completo"
                name="name"
                placeholder="João Silva"
                error={registerState?.errors?.name?.[0]}
              />

              <Input
                label="E-mail"
                type="email"
                name="email"
                placeholder="joao@exemplo.com"
                error={registerState?.errors?.email?.[0]}
                required
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Senha"
                type="password"
                name="password"
                placeholder="••••••••"
                hint={!registerState?.errors?.password ? "Mínimo de 8 caracteres" : undefined}
                error={registerState?.errors?.password?.[0]}
                required
              />

              <Input
                label="Confirmar Senha"
                type="password"
                name="password_confirmation"
                placeholder="••••••••"
                error={registerState?.errors?.password_confirmation?.[0]}
                required
              />

              {registerState?.errors?._form && (
                <Alert variant="error">{registerState.errors._form[0]}</Alert>
              )}

              <Button type="submit" loading={registerPending} fullWidth disabled={registerPending}>
                {registerPending ? "Enviando..." : (
                  <>
                    Continuar
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form action={confirmAction} className="space-y-6">
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="confirmation_code" value={confirmationCode.join("")} />
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Verifique seu e-mail</h2>
                <p className="text-muted text-sm">
                  Enviamos um código de 6 dígitos para<br />
                  <span className="text-foreground font-medium">{email}</span>
                </p>
              </div>

              <CodeInput
                value={confirmationCode}
                onChange={setConfirmationCode}
                disabled={confirmPending}
              />

              <p className="text-center text-xs text-muted">
                O código expira em 5 minutos
              </p>

              {confirmState?.errors?._form && (
                <Alert variant="error" className="text-center">{confirmState.errors._form[0]}</Alert>
              )}
              {confirmState?.errors?.confirmation_code && (
                <Alert variant="error" className="text-center">{confirmState.errors.confirmation_code[0]}</Alert>
              )}

              <Button type="submit" loading={confirmPending} fullWidth disabled={confirmPending}>
                {confirmPending ? "Verificando..." : "Verificar e Criar Conta"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => {
                  setStep("register");
                  setConfirmationCode(["", "", "", "", "", ""]);
                }}
              >
                ← Voltar ao cadastro
              </Button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-muted mt-6">
          Ao se cadastrar, você concorda com nossos{" "}
          <Link href="/terms" className="underline hover:text-foreground transition-colors">Termos de Serviço</Link>
          {" "}e{" "}
          <Link href="/privacy" className="underline hover:text-foreground transition-colors">Política de Privacidade</Link>
        </p>
      </div>
    </div>
  );
}
