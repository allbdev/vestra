"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Rectangle
} from "recharts";
import { PeriodData } from "@/app/actions/dashboard";

interface DashboardBarChartProps {
    periods: PeriodData[];
}

import { formatCurrency } from "@/app/lib/utils";

const CustomTooltip = ({
    active,
    payload,
    label,
}: any) => {
    if (active && payload && payload.length) {
        const value = payload[0].value as number;
        const color = value >= 0 ? "#22c55e" : "#ef4444";

        return (
            <div
                style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "10px",
                }}
            >
                <p style={{ color: "var(--foreground)", fontWeight: 600, marginBottom: "0.25rem" }}>{label}</p>
                <p style={{ color: color, fontSize: "14px" }}>
                    Saldo Acumulado : {formatCurrency(value)}
                </p>
            </div>
        );
    }
    return null;
};

export function DashboardBarChart({ periods }: DashboardBarChartProps) {
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
        accumulated: period.accumulatedNet,
    }));

    return (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 [&_.recharts-legend-item-text]:!text-foreground">
            <h2 className="text-lg font-semibold mb-4">Saldo Acumulado</h2>
            <div className="w-full" style={{ height: "300px", minHeight: "250px" }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
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
                            tickFormatter={(value) =>
                                formatCurrency(value, {
                                    notation: "compact",
                                    maximumFractionDigits: 1,
                                })
                            }
                        />
                        <Tooltip
                            cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                            content={<CustomTooltip />}
                        />
                        <Legend
                            iconType="rect"
                            style={{ color: "var(--foreground)" }}
                        />
                        <Bar
                            dataKey="accumulated"
                            name="Saldo Acumulado"
                            radius={[4, 4, 0, 0]}
                            fill="#22c55e"
                        >
                            {chartData.map((entry, index) => (
                                <Rectangle
                                    key={`cell-${index}`}
                                    fill={entry.accumulated >= 0 ? "#22c55e" : "#ef4444"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
