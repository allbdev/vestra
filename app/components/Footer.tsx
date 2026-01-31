import Link from "next/link";
import { Logo } from "@/app/components/Logo";

export function Footer() {
    return (
        <footer className="relative border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <Logo />
                    <div className="flex flex-wrap gap-6 justify-center text-sm text-muted">
                        <Link href="/#funcionalidades" className="hover:text-foreground transition-colors">
                            Funcionalidades
                        </Link>
                        <Link href="/#planos" className="hover:text-foreground transition-colors">
                            Planos
                        </Link>
                        <Link href="/#sobre" className="hover:text-foreground transition-colors">
                            Sobre
                        </Link>
                        <Link href="/#contato" className="hover:text-foreground transition-colors">
                            Contato
                        </Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">
                            Termos de Uso
                        </Link>
                        <Link href="/privacy" className="hover:text-foreground transition-colors">
                            Política de Privacidade
                        </Link>
                    </div>
                    <p className="text-sm text-muted">
                        © {new Date().getFullYear()} Vestra. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
