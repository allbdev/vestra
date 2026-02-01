"use client";

import { getDashboardData, DashboardData } from "@/app/actions/dashboard";
import { useDashboard } from "@/app/hooks/useDashboard";
import { FilterPopover } from "@/app/components/FilterPopover";
import { KPICard } from "@/app/components/dashboard/KPICard";
import { DashboardLineChart } from "@/app/components/dashboard/DashboardLineChart";
import { DashboardBarChart } from "@/app/components/dashboard/DashboardBarChart";
import { PeriodTransactionsView } from "@/app/components/dashboard/PeriodTransactionsView";
import { FREQUENCY_TYPES } from "@/app/lib/consts";
import { Button, LoadingSpinner } from "@/app/components/ui";
import { AiOutlinePlus, AiOutlineLoading3Quarters } from "react-icons/ai";
import { TransactionFormModal } from "@/app/components/transactions/TransactionFormModal";
import { createTransaction, updateTransaction } from "@/app/actions/transactions";
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
  const [transactionToEdit, setTransactionToEdit] = useState<any | null>(null);

  // Wrapper for create action
  const createAction = async (state: any, formData: FormData) => {
    return await createTransaction(workspaceId, state, formData);
  };

  // Wrapper for update action
  const updateAction = async (state: any, formData: FormData) => {
    if (!transactionToEdit) return { errors: { _form: ["Erro interno: transação não selecionada"] } };
    return await updateTransaction(workspaceId, transactionToEdit.id, state, formData);
  };

  const handleEditTransaction = (transaction: any) => {
    setTransactionToEdit({
      ...transaction,
      amount: transaction.total, // Map total from dashboard to amount
    });
  };

  const closeEditModal = () => {
    setTransactionToEdit(null);
  };

  const showSkeleton = isLoading && !dashboardData;

  return (
    <div className="space-y-6">
      {/* ... (Filters section remains) */}
      <div className="flex justify-between items-start gap-4">
        <div></div>
        <div className="flex items-center gap-2">
          <FilterPopover defaultValues={{ startDate, endDate, periodType }}>
            <FilterPopover.Title>Filtros</FilterPopover.Title>
            <FilterPopover.Content>
              <FilterPopover.StartDate />
              <FilterPopover.PeriodType />
            </FilterPopover.Content>
          </FilterPopover>
          <Button onClick={() => setIsCreateOpen(true)}>
            <AiOutlinePlus className="mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Create Modal */}
      <TransactionFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        categories={categories}
        recurrencies={transactionTemplates}
        action={createAction}
      />

      {/* Edit Modal */}
      <TransactionFormModal
        isOpen={!!transactionToEdit}
        onClose={closeEditModal}
        transactionToEdit={transactionToEdit}
        categories={categories}
        action={updateAction}
      />

      {/* KPIs & Charts ... */}

      {/* KPIs */}
      {showSkeleton ? (
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
        <LoadingWrapper isLoading={isLoading} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title={getPeriodLabel(periodType)}
            value={dashboardData.kpis.bestPeriod ? dashboardData.kpis.bestPeriod.net : 0}
            subtitle={
              dashboardData.kpis.bestPeriod ? dashboardData.kpis.bestPeriod.periodLabel : undefined
            }
          />
          <KPICard title="Entradas" value={dashboardData.kpis.incoming} />
          <KPICard title="Saídas" value={dashboardData.kpis.outcome} />
          <KPICard title="Saldo do Período" value={dashboardData.kpis.balance} />
        </LoadingWrapper>
      ) : (
        <section className="bg-card border border-border rounded-2xl p-6 text-center text-muted">
          Erro ao carregar dados do dashboard.
        </section>
      )}

      {/* Chart */}
      {showSkeleton ? (
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
          <LoadingWrapper isLoading={isLoading} className="h-full">
            <DashboardLineChart periods={dashboardData?.periods || []} />
          </LoadingWrapper>
          <LoadingWrapper isLoading={isLoading} className="h-full">
            <DashboardBarChart periods={dashboardData?.periods || []} />
          </LoadingWrapper>
        </div>
      )}

      {/* Transactions Table */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Transações por Período</h2>
        {showSkeleton ? (
          <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted">
            Carregando...
          </div>
        ) : (
          <LoadingWrapper isLoading={isLoading}>
            <PeriodTransactionsView
              periods={dashboardData?.periods || []}
              onEditTransaction={handleEditTransaction}
              workspaceId={workspaceId}
            />
          </LoadingWrapper>
        )}
      </section>
    </div>
  );
}

function LoadingWrapper({
  children,
  isLoading,
  className,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className || ""}`}>
      {children}
      {isLoading && <LoadingSpinner className="absolute top-2 right-2" />}
    </div>
  );
}