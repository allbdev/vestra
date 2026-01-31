import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { BackgroundEffects } from "../components/BackgroundEffects";
import { verifySession } from "../lib/session";
import { getSessionSelectedWorkspaceId } from "../actions/workspace";

const LAST_UPDATE = '01-31-2026'

export default async function PrivacyPage() {
    const user = await verifySession();
    const selectedWorkspaceId = await getSessionSelectedWorkspaceId();

    return (
        <div className="min-h-screen relative overflow-hidden bg-background">
            <BackgroundEffects />
            <Header user={user} selectedWorkspaceId={selectedWorkspaceId} />

            <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Política de Privacidade
                    </h1>

                    <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introdução</h2>
                            <p>
                                Sua privacidade é importante para nós. É política do Vestra respeitar a sua privacidade em relação a qualquer
                                informação sua que possamos coletar no site Vestra. Esta política está em conformidade com a Lei Geral de
                                Proteção de Dados (LGPD - Lei nº 13.709/2018).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Coleta de Dados</h2>
                            <p>
                                Coletamos apenas as informações estritamente necessárias para o funcionamento do serviço:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li><strong>Nome:</strong> Para identificação no sistema e personalização da experiência.</li>
                                <li><strong>E-mail:</strong> Para login, recuperação de senha e comunicações importantes sobre o serviço.</li>
                                <li><strong>Telefone:</strong> Como meio de contato.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Dados de Pagamento</h2>
                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                                <p className="text-foreground font-medium">
                                    Informação Importante:
                                </p>
                                <p className="mt-2">
                                    Nós <strong>NÃO</strong> armazenamos os dados do seu cartão de crédito em nossos servidores.
                                    Todas as transações de pagamento são processadas por meio de provedores de pagamento seguros e certificados.
                                    Os dados do seu cartão são enviados diretamente e de forma criptografada para o provedor de pagamento.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Uso das Informações</h2>
                            <p>
                                Utilizamos suas informações para:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Fornecer, operar e manter nosso serviço;</li>
                                <li>Melhorar, personalizar e expandir nosso serviço;</li>
                                <li>Entender e analisar como você usa nosso serviço;</li>
                                <li>Enviar e-mails, incluindo confirmações de conta, avisos técnicos, atualizações de segurança e mensagens de suporte.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Seus Direitos (LGPD)</h2>
                            <p>
                                Como titular dos dados, você tem direito a:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Confirmar a existência de tratamento de dados;</li>
                                <li>Acessar seus dados;</li>
                                <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
                                <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;</li>
                                <li>Revogar seu consentimento a qualquer momento.</li>
                            </ul>
                            <p className="mt-4">
                                Para exercer esses direitos, entre em contato conosco.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Segurança</h2>
                            <p>
                                Valorizamos sua confiança em nos fornecer suas informações pessoais e, portanto, envidamos esforços para usar
                                meios comercialmente aceitáveis para protegê-las. No entanto, lembre-se que nenhum método de transmissão pela
                                internet ou método de armazenamento eletrônico é 100% seguro e confiável, e não podemos garantir sua segurança absoluta.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contato</h2>
                            <p>
                                Para questões relacionadas à privacidade e proteção de dados, entre em contato conosco através do nosso
                                formulário de contato na página inicial.
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
