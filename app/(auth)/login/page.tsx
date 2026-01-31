"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Input, Alert } from "@/app/components/ui";
import { BackgroundEffects } from "@/app/components/BackgroundEffects";
import { login } from "@/app/actions/auth";
import { Logo } from "@/app/components/Logo";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundEffects />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in">
          <Logo layout="vertical" iconSize={16} textSize="text-3xl" className="mb-4" />
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
