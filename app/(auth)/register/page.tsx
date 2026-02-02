"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, CodeInput, Alert } from "@/app/components/ui";
import { Step } from "./domain";
import { BackgroundEffects } from "@/app/components/BackgroundEffects";
import { register, confirm, RegisterFormState, ConfirmFormState } from "@/app/actions/auth";
import { Logo } from "@/app/components/Logo";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema, RegisterFormData } from "@/app/lib/schemas";

function RegisterContent() {
  const searchParams = useSearchParams();
  const initialStep = searchParams.get("step") === "confirm" ? "confirm" : "register";
  const initialEmail = searchParams.get("email") || "";

  const [step, setStep] = useState<Step>(initialStep as Step);
  const [confirmationCode, setConfirmationCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [email, setEmail] = useState(initialEmail);
  const [success, setSuccess] = useState(false);

  const [registerState, setRegisterState] = useState<RegisterFormState>({});
  const [confirmState, setConfirmState] = useState<ConfirmFormState>({});
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  // Register Form
  const {
    register: registerField,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: "",
      email: initialEmail,
      password: "",
      password_confirmation: "",
    },
  });

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsRegisterLoading(true);
    setRegisterState({});
    try {
      const result = await register(undefined, data);
      setRegisterState(result);
      if (result.message && !result.errors) {
        setEmail(data.email);
        setStep("confirm");
      }
    } catch (error) {
      console.error(error);
      setRegisterState({ errors: { _form: ["Erro inesperado"] } });
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const onConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmLoading(true);
    setConfirmState({});
    
    try {
      const code = confirmationCode.join("");
      const result = await confirm(undefined, { email, confirmation_code: code });
      setConfirmState(result);
      if (result.success) {
        setSuccess(true);
      }
    } catch (error) {
       console.error(error);
       setConfirmState({ errors: { _form: ["Erro inesperado"] } });
    } finally {
      setIsConfirmLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundEffects />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in">
          <Logo layout="vertical" iconSize={16} textSize="text-3xl" className="mb-4" />
          <p className="text-muted mt-2">Controle suas finanças</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/20 animate-slide-up">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className={`flex items-center gap-2 ${step === "register" ? "text-foreground" : "text-muted"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step === "register" ? "bg-primary text-background" : "bg-primary/20 text-primary"
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step === "confirm" ? "bg-primary text-background" : "bg-card-hover border border-border"
                }`}>
                2
              </div>
              <span className="text-sm font-medium hidden sm:inline">Verificar</span>
            </div>
          </div>

          {step === "register" ? (
            <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="flex flex-col gap-4">
              <Input
                label="Nome Completo"
                placeholder="João Silva"
                error={registerErrors.name?.message || registerState?.errors?.name?.[0]}
                {...registerField("name")}
              />

              <Input
                label="E-mail"
                type="email"
                placeholder="joao@exemplo.com"
                error={registerErrors.email?.message || registerState?.errors?.email?.[0]}
                required
                {...registerField("email")}
              />

              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                hint={!registerState?.errors?.password ? "Mínimo de 8 caracteres" : undefined}
                error={registerErrors.password?.message || registerState?.errors?.password?.[0]}
                required
                {...registerField("password")}
              />

              <Input
                label="Confirmar Senha"
                type="password"
                placeholder="••••••••"
                error={registerErrors.password_confirmation?.message || registerState?.errors?.password_confirmation?.[0]}
                required
                {...registerField("password_confirmation")}
              />

              {registerState?.errors?._form && (
                <Alert variant="error">{registerState.errors._form[0]}</Alert>
              )}

              <Button type="submit" loading={isRegisterLoading} fullWidth disabled={isRegisterLoading}>
                {isRegisterLoading ? "Enviando..." : (
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
            <form onSubmit={onConfirmSubmit} className="space-y-6">
              {/* No hidden inputs here anymore! State is in memory (email, confirmationCode) */}
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
                disabled={isConfirmLoading}
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

              <Button type="submit" loading={isConfirmLoading} fullWidth disabled={isConfirmLoading}>
                {isConfirmLoading ? "Verificando..." : "Verificar e Criar Conta"}
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
