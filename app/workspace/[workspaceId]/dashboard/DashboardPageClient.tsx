"use client";

import { getDashboardData, DashboardData } from "@/app/actions/dashboard";
import { useDashboard } from "@/app/hooks/useDashboard";
import { FilterPopover } from "@/app/components/FilterPopover";
import { KPICard } from "@/app/components/dashboard/KPICard";
import { DashboardLineChart } from "@/app/components/dashboard/DashboardLineChart";
import { DashboardBarChart } from "@/app/components/dashboard/DashboardBarChart";
import { PeriodTransactionsView } from "@/app/components/dashboard/PeriodTransactionsView";
import { FREQUENCY_TYPES } from "@/app/lib/consts";
import { Button } from "@/app/components/ui";
import { AiOutlinePlus } from "react-icons/ai";
import { TransactionFormModal } from "@/app/components/transactions/TransactionFormModal";
import { createTransaction } from "@/app/actions/transactions";
import { useState } from "react";

// Define these locally or import if available, but for now defining based on usage
interface Category {
  id: string;
  name: string;
  type: number;
  color: string | null;
}

interface TransactionTemplate {
  id: string;
  description: string;
  baseAmount: number;
  categoryId: string | null;
  frequency: number | null;
  startDate: string;
  active: boolean;
  category: Category | null;
}

interface DashboardPageClientProps {
  workspaceId: string;
  initialData: DashboardData | null;
  categories: Category[];
  transactionTemplates: TransactionTemplate[];
}

function getPeriodLabel(periodType: number): string {
  switch (periodType) {
    case FREQUENCY_TYPES.DAILY:
      return "Melhor Dia";
    case FREQUENCY_TYPES.WEEKLY:
      return "Melhor Semana";
    case FREQUENCY_TYPES.MONTHLY:
      return "Melhor Mês";
    default:
      return "Melhor Período";
  }
}

export function DashboardPageClient({
  workspaceId,
  initialData,
  categories,
  transactionTemplates,
}: DashboardPageClientProps) {
  const { dashboardData, isLoading, periodType, startDate, endDate } = useDashboard(workspaceId, initialData);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Wrapper for create action
  const createAction = async (state: any, formData: FormData) => {
    return await createTransaction(workspaceId, state, formData);
  };

  console.log('isLoading', isLoading);

  return (
    <div className="space-y-6">
      {/* Filters */}
      {/* Filters & Actions */}
      <div className="flex justify-between items-start gap-4">
        <div>
          {/* Add a title or something here if needed, otherwise empty div is fine for spacing if we want filters on right */}
        </div>
        <div className="flex items-center gap-2">
          <FilterPopover
            defaultValues={{ startDate, endDate, periodType }}
          >
            <FilterPopover.Title>Filtros</FilterPopover.Title>
            <FilterPopover.StartDate />
            <FilterPopover.PeriodType />
          </FilterPopover>
          <Button onClick={() => setIsCreateOpen(true)}>
            <AiOutlinePlus className="mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      <TransactionFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        categories={categories}
        recurrencies={transactionTemplates}
        action={createAction}
      />

      {/* KPIs */}
      {isLoading ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted">
            Carregando...
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted">
            Carregando...
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted">
            Carregando...
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted">
            Carregando...
          </div>
        </section>
      ) : dashboardData ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title={getPeriodLabel(periodType)}
            value={
              dashboardData.kpis.bestPeriod
                ? dashboardData.kpis.bestPeriod.net
                : 0
            }
            subtitle={
              dashboardData.kpis.bestPeriod
                ? dashboardData.kpis.bestPeriod.periodLabel
                : undefined
            }
          />
          <KPICard
            title="Entradas"
            value={dashboardData.kpis.incoming}
          />
          <KPICard
            title="Saídas"
            value={dashboardData.kpis.outcome}
          />
          <KPICard
            title="Saldo do Período"
            value={dashboardData.kpis.balance}
          />
        </section>
      ) : (
        <section className="bg-card border border-border rounded-2xl p-6 text-center text-muted">
          Erro ao carregar dados do dashboard.
        </section>
      )}

      {/* Chart */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted">
            Carregando gráfico...
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted">
            Carregando gráfico...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardLineChart periods={dashboardData?.periods || []} />
          <DashboardBarChart periods={dashboardData?.periods || []} />
        </div>
      )}

      {/* Transactions Table */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Transações por Período</h2>
        {isLoading ? (
          <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted">
            Carregando...
          </div>
        ) : (
          <PeriodTransactionsView periods={dashboardData?.periods || []} />
        )}
      </section>
    </div>
  );
}

