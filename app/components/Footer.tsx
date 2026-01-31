import Link from "next/link";

export function Footer() {
    return (
        <footer className="relative border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-foreground">Vestra</span>
                    </div>
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
