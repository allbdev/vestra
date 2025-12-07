"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Step = "register" | "confirm";

interface FormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("register");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [confirmationCode, setConfirmationCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Algo deu errado");
        return;
      }

      setStep("confirm");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newCode = [...confirmationCode];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setConfirmationCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      codeInputRefs.current[nextIndex]?.focus();
    } else {
      const newCode = [...confirmationCode];
      newCode[index] = value.replace(/\D/g, "");
      setConfirmationCode(newCode);
      if (value && index < 5) {
        codeInputRefs.current[index + 1]?.focus();
      }
    }
    setError("");
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !confirmationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = confirmationCode.join("");
    
    if (code.length !== 6) {
      setError("Digite o código completo de 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          confirmation_code: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Código de confirmação inválido");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === "confirm") {
      codeInputRefs.current[0]?.focus();
    }
  }, [step]);

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
                className="inline-block w-full py-3 px-4 bg-primary hover:bg-primary-hover text-background font-semibold rounded-xl transition-all duration-200"
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
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-muted mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted/50"
                  placeholder="João Silva"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-muted mb-2">
                  E-mail <span className="text-primary">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted/50"
                  placeholder="joao@exemplo.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-muted mb-2">
                  Senha <span className="text-primary">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted/50"
                  placeholder="••••••••"
                />
                <p className="text-xs text-muted mt-1.5">Mínimo de 8 caracteres</p>
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-muted mb-2">
                  Confirmar Senha <span className="text-primary">*</span>
                </label>
                <input
                  type="password"
                  id="password_confirmation"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted/50"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-sm animate-fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-background font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    Continuar
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirmSubmit} className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Verifique seu e-mail</h2>
                <p className="text-muted text-sm">
                  Enviamos um código de 6 dígitos para<br />
                  <span className="text-foreground font-medium">{formData.email}</span>
                </p>
              </div>

              <div className="flex justify-center gap-2">
                {confirmationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { codeInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold bg-background border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                ))}
              </div>

              <p className="text-center text-xs text-muted">
                O código expira em 5 minutos
              </p>

              {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-sm text-center animate-fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-background font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verificando...
                  </>
                ) : (
                  "Verificar e Criar Conta"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("register");
                  setConfirmationCode(["", "", "", "", "", ""]);
                  setError("");
                }}
                className="w-full py-2 text-muted hover:text-foreground text-sm transition-colors"
              >
                ← Voltar ao cadastro
              </button>
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

function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-[15%] w-3 h-3 bg-primary/40 rounded-full animate-float" />
      <div className="absolute top-40 right-[20%] w-2 h-2 bg-accent/40 rounded-full animate-float-delayed" />
      <div className="absolute bottom-32 left-[25%] w-4 h-4 bg-primary/30 rounded-full animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-48 right-[15%] w-2 h-2 bg-accent/30 rounded-full animate-float-delayed" style={{ animationDelay: "0.5s" }} />
    </div>
  );
}
