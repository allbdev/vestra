"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { getDashboardData, DashboardData } from "@/app/actions/dashboard";
import { FREQUENCY_TYPES } from "@/app/lib/consts";

import { getDefaultDateRange } from "@/app/lib/date";

export function useDashboard(workspaceId: string, initialData: DashboardData | null) {
    const searchParams = useSearchParams();
    const defaultDates = getDefaultDateRange();

    // Derived state from URL or defaults
    const startDate = searchParams.get("startDate") || defaultDates.startDate;
    const endDate = searchParams.get("endDate") || defaultDates.endDate;
    const periodType = searchParams.get("periodType")
        ? Number(searchParams.get("periodType"))
        : FREQUENCY_TYPES.MONTHLY;

    const [dashboardData, setDashboardData] = useState<DashboardData | null>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const isInitialMount = useRef(true);

    // Fetch data when filters change
    useEffect(() => {
        // Skip initial fetch if we have initialData
        if (isInitialMount.current && initialData) {
            isInitialMount.current = false;
            return;
        }
        isInitialMount.current = false;

        let isMounted = true;

        async function fetchData() {
            console.log('fetching data');
            setIsLoading(true);
            try {
                const data = await getDashboardData(workspaceId, startDate, endDate, periodType);
                if (isMounted) {
                    setDashboardData(data);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [workspaceId, startDate, endDate, periodType, initialData]);

    return {
        dashboardData,
        isLoading,
        startDate,
        endDate,
        periodType,
    };
}
