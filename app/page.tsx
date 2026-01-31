import Link from "next/link";
import { Header } from "./components/Header";
import { BackgroundEffects } from "./components/BackgroundEffects";
import { Button } from "./components/ui";
import { verifySession } from "./lib/session";
import { getSessionSelectedWorkspaceId } from "./actions/workspace";
import { FeatureCard } from "./components/home/FeatureCard";
import { PlanCard } from "./components/home/PlanCard";
import { ContactForm } from "./components/home/ContactForm";
import {
  LuLayoutDashboard,
  LuArrowRightLeft,
  LuCalendarClock,
  LuBriefcase,
  LuCreditCard,
  LuChartBar,
  LuSheet
} from "react-icons/lu";
import { VscRobot } from "react-icons/vsc";

export default async function Home() {
  const user = await verifySession();
  const selectedWorkspaceId = await getSessionSelectedWorkspaceId();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects />
      <Header user={user} selectedWorkspaceId={selectedWorkspaceId} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Controle suas finanças
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                de forma simples
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted mb-10 max-w-2xl mx-auto">
              Gerencie suas despesas, acompanhe seus gastos e alcance seus objetivos financeiros com o Vestra.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" fullWidth={false}>
                  Criar Conta Grátis
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
              <a href="#funcionalidades">
                <Button variant="secondary" size="lg" fullWidth={false}>
                  Saiba Mais
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Funcionalidades</h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Tudo que você precisa para ter controle total das suas finanças
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<LuLayoutDashboard className="w-7 h-7" />}
              title="Dashboard Completo"
              description="Visualize todas as suas finanças em um único lugar. Acompanhe receitas, despesas e saldo em tempo real."
            />
            <FeatureCard
              icon={<LuArrowRightLeft className="w-7 h-7" />}
              title="Gestão de Transações"
              description="Registre receitas e despesas, categorize gastos e mantenha o controle total do seu dinheiro."
            />
            <FeatureCard
              icon={<LuCalendarClock className="w-7 h-7" />}
              title="Transações Recorrentes"
              description="Automatize o registro de contas fixas e salários. Nunca mais esqueça de pagar um boleto."
            />
            <FeatureCard
              icon={<LuBriefcase className="w-7 h-7" />}
              title="Múltiplos Workspaces"
              description="Gerencie finanças pessoais e empresariais em espaços separados e organizados."
            />
            <FeatureCard
              icon={<LuChartBar className="w-7 h-7" />}
              title="Relatórios Detalhados"
              description="Analise seus hábitos de consumo com gráficos intuitivos e tome melhores decisões financeiras."
            />
            <FeatureCard
              icon={<LuCreditCard className="w-7 h-7" />}
              title="Cartão de Crédito"
              description="Gerencie faturas, limites e datas de vencimento de todos os seus cartões em um só lugar."
              comingSoon
            />
            <FeatureCard
              icon={<VscRobot className="w-7 h-7" />}
              title="Assistente de IA"
              description="Conte com um assistente de IA para ajudar você a gerenciar suas finanças 24/7."
              comingSoon
            />
            <FeatureCard
              icon={<LuSheet className="w-7 h-7" />}
              title="Export dados em planilhas"
              description="Exporte seus dados em planilhas para análise e relatórios."
              comingSoon
            />
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planos" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-muted/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Planos</h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Comece gratuitamente e evolua conforme suas necessidades
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PlanCard
              name="Basic"
              price="R$ 0"
              description="Ideal para quem está começando a organizar as finanças."
              buttonText="Começar Agora"
              href="/register"
              features={[
                { name: "1 Workspace", included: true },
                { name: "2 Usuários por Workspace", included: true },
                { name: "Dashboard Básico", included: true },
                { name: "Transações Ilimitadas", included: true },
                { name: "Gestão de Cartões", included: false },
                { name: "Exportação de Dados", included: false },
              ]}
            />
            <PlanCard
              name="Pro"
              price="R$ 19,90"
              description="Para quem quer controle total e funcionalidades avançadas."
              buttonText="Assinar Pro"
              isPopular
              comingSoon
              link="#contato"
              features={[
                { name: "Workspaces Ilimitados", included: true },
                { name: "Usuários Ilimitados por Workspace", included: true },
                { name: "Dashboard Avançado", included: true },
                { name: "Transações Ilimitadas", included: true },
                { name: "Gestão de Cartões", included: true },
                { name: "Exportação de Dados", included: true },
                { name: "Assistente IA", included: true },
              ]}
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Sobre o Vestra</h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Uma solução completa para gerenciar suas finanças pessoais
            </p>
          </div>
          <div className="prose prose-invert max-w-none text-center">
            <p className="text-lg text-muted leading-relaxed">
              O Vestra foi criado para simplificar o gerenciamento financeiro pessoal.
              Com uma interface intuitiva e funcionalidades poderosas, você pode acompanhar
              seus gastos, definir orçamentos, criar metas e tomar decisões financeiras mais
              inteligentes. Tudo isso de forma segura, rápida e gratuita.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-3xl p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto para começar?
            </h2>
            <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
              Junte-se a milhares de pessoas que já estão no controle das suas finanças com o Vestra.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" fullWidth={false}>
                  Criar Conta Grátis
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" fullWidth={false}>
                  Já tenho uma conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Entre em Contato</h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Tem alguma dúvida, sugestão ou encontrou um problema? Envie uma mensagem para nós.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border py-12 px-4 sm:px-6 lg:px-8">
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
              <a href="#funcionalidades" className="hover:text-foreground transition-colors">
                Funcionalidades
              </a>
              <a href="#planos" className="hover:text-foreground transition-colors">
                Planos
              </a>
              <a href="#sobre" className="hover:text-foreground transition-colors">
                Sobre
              </a>
              <a href="#contato" className="hover:text-foreground transition-colors">
                Contato
              </a>
            </div>
            <p className="text-sm text-muted">
              © {new Date().getFullYear()} Vestra. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
