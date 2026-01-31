"use client";

import { PeriodData } from "@/app/actions/dashboard";
import { StatusBadge } from "@/app/components/transactions/StatusBadge";

interface PeriodTransactionsViewProps {
  periods: PeriodData[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function PeriodTransactionsView({
  periods,
}: PeriodTransactionsViewProps) {
  if (periods.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted">
        Nenhuma transação encontrada no período selecionado.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {periods.map((period) => (
        <div
          key={period.periodKey}
          className="bg-card border border-border rounded-2xl p-4 sm:p-6 flex flex-col"
        >
          <h3 className="text-lg font-semibold mb-4 text-center">
            {period.periodLabel}
          </h3>

          <div className="flex-1 space-y-4">
            {/* Incoming Section */}
            <div>
              <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                RECEBER
              </h4>
              {period.incoming.byTransaction.length > 0 ? (
                <div className="space-y-2">
                  {period.incoming.byTransaction.map((trans, index) => (
                    <div
                      key={`${trans.description}-${index}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="truncate">
                          {trans.description}
                        </span>
                        {/* Assuming trans has isPaid/date info. PeriodData definition implies it groups by description? 
                              Let's check PeriodData in action.
                              It seems PeriodTransaction is { description: string, total: number, count: number }. 
                              If it groups by description, we lose individual status.
                              "I want a badge indicating either the transaction is paid or not (this need to be aplied in both transactions page and PeriodTransactionsView)"
                              
                              If PeriodTransactionsView aggregates, we can't show per-transaction status properly unless we change aggregation 
                              OR if the prompt assumes PeriodTransactionsView currently lists individual transactions (which the screenshot/code might suggest if grouping is one-to-one?).
                              
                              The code says: `period.incoming.byTransaction`.
                              If `byTransaction` is aggregated, we can't show status.
                              However, checking `app/actions/dashboard.ts` (implied by imports) would confirm.
                              But the user *requested* it here.
                              
                              If I look at the code:
                              `{trans.description}`
                              `{formatCurrency(trans.total)}`
                              
                              It seems to be aggregated.
                              "I want a badge... applied in ... PeriodTransactionsView"
                              
                              If I cannot fulfill this because of aggregation, I should perhaps use a simplified heuristic or simple badge if *all* are paid?
                              Or maybe the user thinks this view lists transactions but it lists summaries.
                              
                              However, if I look closer at `PeriodTransactionsView`, it imports `PeriodData`.
                              Let's assume for now I CANNOT easily add it here without changing backend aggregation, 
                              BUT the user request is specific.
                              
                              Maybe I should check `app/actions/dashboard.ts`.
                              
                              If I can't do it now, I'll update the plan to reflect I need to check dashboard action.
                              
                              For now, I will skip this part of the replace and stick to transactions page and then investigate dashboard action.
                              
                              Actually, I'll check dashboard action now.
                          */}
                      </div>
                      <span className="text-green-600 dark:text-green-400 font-medium flex-shrink-0">
                        {formatCurrency(trans.total)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted">Nenhuma entrada</p>
              )}
            </div>

            {/* Outcome Section */}
            <div>
              <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                PAGAR
              </h4>
              {period.outcome.byTransaction.length > 0 ? (
                <div className="space-y-2">
                  {period.outcome.byTransaction.map((trans, index) => (
                    <div
                      key={`${trans.description}-${index}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="truncate">
                          {trans.description}
                        </span>
                        <StatusBadge isPaid={trans.isPaid} date={trans.date} showLabel={false} className="w-2 h-2 p-0" />
                      </div>
                      <span className="text-red-600 dark:text-red-400 font-medium flex-shrink-0">
                        {formatCurrency(trans.total)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted">Nenhuma saída</p>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="pt-4 mt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Total Entradas
              </span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(period.incoming.total)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Total Saídas
              </span>
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(period.outcome.total)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm font-semibold">Saldo</span>
              <span
                className={`text-base font-bold ${period.net >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
                  }`}
              >
                {formatCurrency(period.net)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
