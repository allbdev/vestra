"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PeriodData } from "@/app/actions/dashboard";

interface DashboardLineChartProps {
  periods: PeriodData[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function DashboardLineChart({ periods }: DashboardLineChartProps) {
  if (periods.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted">
        Nenhum dado disponível para o gráfico.
      </div>
    );
  }

  // Transform periods data for the chart
  const chartData = periods.map((period) => ({
    period: period.periodLabel,
    incoming: period.incoming.total,
    outcome: period.outcome.total,
    total: period.net,
  }));

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 [&_.recharts-legend-item-text]:!text-foreground">
      <h2 className="text-lg font-semibold mb-4">Preview do período selecionado</h2>
      <div className="w-full" style={{ height: "300px", minHeight: "250px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="period"
              stroke="var(--foreground)"
              tick={{ fill: "var(--foreground)", fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="var(--foreground)"
              tick={{ fill: "var(--foreground)", fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--foreground)",
              }}
              formatter={(value) =>
                typeof value === "number" ? formatCurrency(value) : ""
              }
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Legend
              iconType="line"
              style={{ color: "var(--foreground)" }}
            />
            <Line
              type="monotone"
              dataKey="incoming"
              name="Entradas"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="outcome"
              name="Saídas"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
