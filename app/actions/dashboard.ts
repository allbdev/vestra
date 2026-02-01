"use server";

import { cache } from "react";
import { db as prisma } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";
import { CATEGORY_TYPES, FREQUENCY_TYPES } from "@/app/lib/consts";

export interface DashboardTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: {
    id: string;
    name: string;
    type: number;
    color: string | null;
  } | null;
}

// Update Interface
export interface PeriodData {
  periodKey: string;
  periodLabel: string;
  incoming: {
    total: number;
    byTransaction: Array<{
      id: string;
      description: string;
      total: number;
      date: string;
      isPaid: boolean;
      paidAt: string | null;
      categoryId: string | null; // Changed to nullable
    }>;
  };
  outcome: {
    total: number;
    byTransaction: Array<{
      id: string;
      description: string;
      total: number;
      date: string;
      isPaid: boolean;
      paidAt: string | null;
      categoryId: string | null; // Changed to nullable
    }>;
  };
  net: number;
  accumulatedNet: number;
}



export interface DashboardData {
  kpis: {
    bestPeriod: {
      periodKey: string;
      periodLabel: string;
      net: number;
    } | null;
    incoming: number;
    outcome: number;
    balance: number;
  };
  periods: PeriodData[];
}

function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7)); // Get to Monday of the week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

function getPeriodKey(date: Date, periodType: number): string {
  const year = date.getUTCFullYear();

  switch (periodType) {
    case FREQUENCY_TYPES.DAILY:
      const day = String(date.getUTCDate()).padStart(2, "0");
      const dailyMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
      return `${year}-${dailyMonth}-${day}`;

    case FREQUENCY_TYPES.WEEKLY:
      // Get ISO week
      const { year: weekYear, week } = getISOWeek(date);
      return `${weekYear}-W${String(week).padStart(2, "0")}`;

    case FREQUENCY_TYPES.MONTHLY:
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;

    case FREQUENCY_TYPES.YEARLY:
      return `${year}`;

    default:
      const defaultMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
      return `${year}-${defaultMonth}`;
  }
}

function getPeriodLabel(periodKey: string, periodType: number): string {
  switch (periodType) {
    case FREQUENCY_TYPES.DAILY:
      const [year, month, day] = periodKey.split("-");
      return `${day}/${month}/${year}`;

    case FREQUENCY_TYPES.WEEKLY:
      const [wYear, wWeek] = periodKey.split("-W");
      return `Semana ${wWeek}/${wYear}`;

    case FREQUENCY_TYPES.MONTHLY:
      const [y, m] = periodKey.split("-");
      const monthNames = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
      ];
      return `${monthNames[parseInt(m) - 1] || m}/${y}`;

    case FREQUENCY_TYPES.YEARLY:
      return periodKey;

    default:
      const [y2, m2] = periodKey.split("-");
      const monthNames2 = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
      ];
      return `${monthNames2[parseInt(m2) - 1] || m2}/${y2}`;
  }
}

function generateAllPeriods(
  start: Date,
  end: Date,
  periodType: number
): Map<string, PeriodData> {
  const periodMap = new Map<string, PeriodData>();
  const current = new Date(start);

  while (current <= end) {
    const periodKey = getPeriodKey(current, periodType);

    if (!periodMap.has(periodKey)) {
      periodMap.set(periodKey, {
        periodKey,
        periodLabel: getPeriodLabel(periodKey, periodType),
        incoming: {
          total: 0,
          byTransaction: [],
        },
        outcome: {
          total: 0,
          byTransaction: [],
        },
        net: 0,
        accumulatedNet: 0,
      });
    }

    // Move to next period
    switch (periodType) {
      case FREQUENCY_TYPES.DAILY:
        current.setUTCDate(current.getUTCDate() + 1);
        break;
      case FREQUENCY_TYPES.WEEKLY:
        // Add 7 days - getPeriodKey will handle week grouping
        current.setUTCDate(current.getUTCDate() + 7);
        break;
      case FREQUENCY_TYPES.MONTHLY:
        current.setUTCMonth(current.getUTCMonth() + 1);
        current.setUTCDate(1); // First day of month
        break;
      case FREQUENCY_TYPES.YEARLY:
        current.setUTCFullYear(current.getUTCFullYear() + 1);
        current.setUTCMonth(0); // January
        current.setUTCDate(1); // First day
        break;
      default:
        current.setUTCMonth(current.getUTCMonth() + 1);
        current.setUTCDate(1);
    }
  }

  return periodMap;
}

/**
 * Get dashboard data for a workspace
 * CACHED: Deduplicated within a single request (based on all arguments)
 */
export const getDashboardData = cache(async (
  workspaceId: string,
  startDate: string,
  endDate: string,
  periodType: number
): Promise<DashboardData | null> => {
  const user = await verifySession();
  if (!user) return null;

  try {
    // Parse dates as UTC to avoid timezone issues
    const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
    const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
    const start = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0));
    const end = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999));

    // Fetch transactions in the date range
    const transactions = await prisma.transaction.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        category: true,
      },
      orderBy: { date: "asc" },
    });

    // Generate all periods in the date range first
    const periodMap = generateAllPeriods(start, end, periodType);

    let totalIncoming = 0;
    let totalOutcome = 0;
    let bestPeriod: { periodKey: string; periodLabel: string; net: number } | null = null;

    // Process transactions and fill in period data
    for (const transaction of transactions) {
      const transactionDate = new Date(transaction.date);
      const periodKey = getPeriodKey(transactionDate, periodType);

      // Period should already exist, but create if missing (safety check)
      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, {
          periodKey,
          periodLabel: getPeriodLabel(periodKey, periodType),
          incoming: {
            total: 0,
            byTransaction: [],
          },
          outcome: {
            total: 0,
            byTransaction: [],
          },
          net: 0,
          accumulatedNet: 0,
        });
      }

      const period = periodMap.get(periodKey)!;
      const amount = Number(transaction.amount);
      const category = transaction.category;

      if (category && category.type === CATEGORY_TYPES.INCOME) {
        period.incoming.total += amount;
        totalIncoming += amount;

        // No grouping, just list
        period.incoming.byTransaction.push({
          id: transaction.id,
          description: transaction.description,
          total: amount,
          date: transaction.date.toISOString(),
          isPaid: transaction.isPaid,
          paidAt: transaction.paidAt ? transaction.paidAt.toISOString() : null,
          categoryId: transaction.categoryId,
        });
      } else if (category && category.type === CATEGORY_TYPES.EXPENSE) {
        period.outcome.total += amount;
        totalOutcome += amount;

        // No grouping, just list
        period.outcome.byTransaction.push({
          id: transaction.id,
          description: transaction.description,
          total: amount,
          date: transaction.date.toISOString(),
          isPaid: transaction.isPaid,
          paidAt: transaction.paidAt ? transaction.paidAt.toISOString() : null,
          categoryId: transaction.categoryId,
        });
      }

      period.net = period.incoming.total - period.outcome.total;
    }

    // Sort periods by periodKey
    const sortedPeriods = Array.from(periodMap.values()).sort((a, b) => {
      return a.periodKey.localeCompare(b.periodKey);
    });

    // Calculate accumulated net
    let accumulatedNet = 0;
    for (const period of sortedPeriods) {
      accumulatedNet += period.net;
      period.accumulatedNet = accumulatedNet;
    }

    // Find best period (highest net)
    for (const period of periodMap.values()) {
      if (!bestPeriod || period.net > bestPeriod.net) {
        bestPeriod = {
          periodKey: period.periodKey,
          periodLabel: period.periodLabel,
          net: period.net,
        };
      }
    }

    return {
      kpis: {
        bestPeriod,
        incoming: totalIncoming,
        outcome: totalOutcome,
        balance: totalIncoming - totalOutcome,
      },
      periods: sortedPeriods,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return null;
  }
});

