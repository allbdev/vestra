"use client";

import { PeriodData } from "@/app/actions/dashboard";
import { StatusBadge } from "@/app/components/transactions/StatusBadge";
import { formatCurrency } from "@/app/lib/utils";
import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { Button } from "@/app/components/ui";
import { DeleteTransactionModal } from "@/app/components/transactions/DeleteTransactionModal";

interface PeriodTransactionsViewProps {
  periods: PeriodData[];
  onEditTransaction?: (transaction: any) => void;
  workspaceId: string;
}

export function PeriodTransactionsView({
  periods,
  onEditTransaction,
  workspaceId
}: PeriodTransactionsViewProps) {
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  if (periods.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted">
        Nenhuma transação encontrada no período selecionado.
      </div>
    );
  }

  return (
    <>
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
                        className="flex items-center justify-between text-sm group"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => onEditTransaction?.(trans)}
                            className="truncate hover:underline cursor-pointer text-left focus:outline-none"
                          >
                            {trans.description}
                          </button>
                          
                          <Button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTransactionToDelete(trans.id);
                            }}
                            className="cursor-pointer text-muted-foreground/30 hover:text-red-500 focus:outline-none transition-colors"
                            title="Excluir"
                            variant="unstyled"
                          >
                            <AiOutlineDelete className="w-3 h-3" />
                          </Button>

                          <StatusBadge isPaid={trans.isPaid} date={trans.date} className="!text-[10px]" />
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
                        className="flex items-center justify-between text-sm group"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => onEditTransaction?.(trans)}
                            className="truncate hover:underline cursor-pointer text-left focus:outline-none"
                          >
                            {trans.description}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTransactionToDelete(trans.id);
                            }}
                            className="text-muted-foreground/30 hover:text-red-500 focus:outline-none transition-colors"
                            title="Excluir"
                          >
                            <AiOutlineDelete className="w-3 h-3" />
                          </button>

                          <StatusBadge isPaid={trans.isPaid} date={trans.date} className="!text-[10px]" />
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

            {/* Total Section */}
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

      {transactionToDelete && (
        <DeleteTransactionModal
          isOpen={!!transactionToDelete}
          onClose={() => setTransactionToDelete(null)}
          transactionId={transactionToDelete || ""}
          workspaceId={workspaceId}
        />
      )}
    </>
  );
}
