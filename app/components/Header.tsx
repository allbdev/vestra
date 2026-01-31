"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui";
import { logout } from "@/app/actions/auth";
import { LuMenu, LuX, LuLogOut, LuUser } from "react-icons/lu";

interface HeaderProps {
  user?: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  selectedWorkspaceId: string | null;
}

export function Header({ user, selectedWorkspaceId }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const dashboardHref = selectedWorkspaceId ? `/workspace/${selectedWorkspaceId}/dashboard` : "/workspace";

  const handleLogout = async () => {
    await logout({ shouldRedirect: false });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isMenuOpen
        ? "bg-card/80 backdrop-blur-md border-b border-border shadow-lg"
        : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group relative z-50" onClick={() => setIsMenuOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">Vestra</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#funcionalidades" className="text-muted hover:text-foreground transition-colors">
              Funcionalidades
            </Link>
            <Link href="/#planos" className="text-muted hover:text-foreground transition-colors">
              Planos
            </Link>
            <Link href="/#sobre" className="text-muted hover:text-foreground transition-colors">
              Sobre
            </Link>
            <Link href="/#contato" className="text-muted hover:text-foreground transition-colors">
              Contato
            </Link>
          </nav>

          {/* Desktop CTA / User */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href={dashboardHref}>
                  <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-sm font-semibold text-muted hover:border-primary hover:text-primary transition-colors">
                    {user.name?.charAt(0).toUpperCase() || <LuUser className="w-5 h-5" />}
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-muted hover:text-destructive transition-colors p-2"
                  title="Sair"
                >
                  <LuLogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">Entrar</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden relative z-50 text-muted-foreground hover:text-foreground p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <LuX className="w-7 h-7" /> : <LuMenu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 h-[100dvh] bg-background z-40 md:hidden transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="container mx-auto px-4 pt-24 pb-8 flex flex-col h-full overflow-y-auto">

          {user && (
            <div className="mb-8 p-4 bg-card border border-border rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {user.name?.charAt(0).toUpperCase() || <LuUser />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}

          <nav className="flex flex-col gap-6 text-xl">
            {user && (
              <Link
                href={dashboardHref}
                className="font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Acessar Dashboard
              </Link>
            )}
            <Link href="/#funcionalidades" className="text-muted hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
              Funcionalidades
            </Link>
            <Link href="/#planos" className="text-muted hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
              Planos
            </Link>
            <Link href="/#sobre" className="text-muted hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
              Sobre
            </Link>
            <Link href="/#contato" className="text-muted hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
              Contato
            </Link>
          </nav>

          <div className="mt-auto pt-8 border-t border-border">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-destructive hover:text-destructive/80 font-medium w-full p-2"
              >
                <LuLogOut className="w-6 h-6" />
                Sair da conta
              </button>
            ) : (
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button fullWidth size="lg">Entrar</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
