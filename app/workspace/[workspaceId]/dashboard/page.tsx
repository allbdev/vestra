export default function DashboardPage() {
  return (
    <>
      <section className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-2">Bem-vindo ao seu painel</h2>
        <p className="text-muted mb-4">
          Esta é apenas uma tela de exemplo (hello world). Em breve você verá aqui um resumo das suas finanças.
        </p>
        <pre className="bg-background border border-border rounded-xl p-4 text-xs text-muted overflow-x-auto">
          <code>console.log("Hello, Vestra dashboard!");</code>
        </pre>
      </section>

      {/* Placeholder for future widgets */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="h-32 bg-card border border-dashed border-border/70 rounded-2xl flex items-center justify-center text-muted text-sm">
          Card de saldo / resumo (em breve)
        </div>
        <div className="h-32 bg-card border border-dashed border-border/70 rounded-2xl flex items-center justify-center text-muted text-sm">
          Gráfico de gastos (em breve)
        </div>
        <div className="h-32 bg-card border border-dashed border-border/70 rounded-2xl flex items-center justify-center text-muted text-sm">
          Lista de próximas contas (em breve)
        </div>
      </section>
    </>
  );
}

