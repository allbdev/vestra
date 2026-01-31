import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { BackgroundEffects } from "../components/BackgroundEffects";
import { verifySession } from "../lib/session";
import { getSessionSelectedWorkspaceId } from "../actions/workspace";

const LAST_UPDATE = '01-31-2026'

export default async function TermsPage() {
    const user = await verifySession();
    const selectedWorkspaceId = await getSessionSelectedWorkspaceId();

    return (
        <div className="min-h-screen relative overflow-hidden bg-background">
            <BackgroundEffects />
            <Header user={user} selectedWorkspaceId={selectedWorkspaceId} />

            <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Termos de Uso
                    </h1>

                    <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Aceitação dos Termos</h2>
                            <p>
                                Ao acessar e usar o Vestra ("Serviço"), você concorda em cumprir e estar vinculado a estes Termos de Uso.
                                Se você não concordar com qualquer parte destes termos, você não deve usar o Serviço.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Descrição do Serviço</h2>
                            <p>
                                O Vestra é uma plataforma de gestão financeira pessoal que permite aos usuários gerenciar despesas,
                                acompanhar gastos, criar orçamentos e visualizar relatórios financeiros. O Serviço é fornecido "como está"
                                e "conforme disponível".
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Responsabilidades do Usuário</h2>
                            <p>
                                Você é responsável por manter a confidencialidade de sua conta e senha. Você concorda em fornecer informações
                                verdadeiras, exatas, atuais e completas durante o processo de registro. Você é inteiramente responsável por
                                todas as atividades que ocorram sob sua conta.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Isenção de Responsabilidade Financeira</h2>
                            <p>
                                O Vestra é uma ferramenta de organização e planejamento. Não fornecemos consultoria financeira, legal ou fiscal.
                                As informações fornecidas pelo Serviço não devem ser interpretadas como aconselhamento profissional.
                                Você é o único responsável por suas decisões financeiras.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Propriedade Intelectual</h2>
                            <p>
                                O Serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão de propriedade exclusiva do
                                Vestra e de seus licenciadores. O Serviço é protegido por direitos autorais e outras leis do Brasil e de outros países.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Alterações nos Termos</h2>
                            <p>
                                Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material,
                                tentaremos fornecer um aviso com pelo menos 30 dias de antecedência antes que quaisquer novos termos entrem em vigor.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contato</h2>
                            <p>
                                Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco através do nosso formulário de contato
                                na página inicial.
                            </p>
                        </section>

                        <p className="text-sm pt-8 border-t border-border">
                            Última atualização: {new Date(LAST_UPDATE).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

