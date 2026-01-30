"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Input, Alert } from "@/app/components/ui";
import { BackgroundEffects } from "@/app/components/BackgroundEffects";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

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
          <p className="text-muted mt-2">Bem-vindo de volta!</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/20 animate-slide-up">
          <form action={action} className="flex flex-col gap-4">
            <Input
              label="E-mail"
              type="email"
              name="email"
              placeholder="joao@exemplo.com"
              error={state?.errors?.email?.[0]}
              required
            />

            <Input
              label="Senha"
              type="password"
              name="password"
              placeholder="••••••••"
              error={state?.errors?.password?.[0]}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary/20"
                />
                <span>Lembrar-me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary-hover transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {state?.errors?._form && (
              <Alert variant="error">{state.errors._form[0]}</Alert>
            )}

            <Button type="submit" loading={pending} fullWidth disabled={pending}>
              {pending ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted mb-4">
              Ainda não tem uma conta?
            </p>
            <Link href="/register">
              <Button variant="secondary" fullWidth>
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted mt-6">
          Ao entrar, você concorda com nossos{" "}
          <Link href="/terms" className="underline hover:text-foreground transition-colors">
            Termos de Serviço
          </Link>
          {" "}e{" "}
          <Link href="/privacy" className="underline hover:text-foreground transition-colors">
            Política de Privacidade
          </Link>
        </p>
      </div>
    </div>
  );
}
