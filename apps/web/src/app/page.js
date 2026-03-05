"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { TopBar } from "@/components/TopBar";
import { KpiCard } from "@/components/KpiCard";
import { DataPanel } from "@/components/DataPanel";
import { DataTable } from "@/components/DataTable";
import { MiniBar } from "@/components/MiniBar";
import { KpiSkeleton, TableSkeleton } from "@/components/Skeletons";
import {
    fetchSummary,
    fetchTopCategories,
    fetchTopMerchants,
    fetchBalances
} from "@/lib/api";

export default function Dashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    // Get dates from URL or use defaults
    const fromParam = searchParams.get("from") || format(startOfMonth(new Date()), "yyyy-MM-dd");
    const toParam = searchParams.get("to") || format(endOfMonth(new Date()), "yyyy-MM-dd");

    const [dateRange, setDateRange] = useState({ from: fromParam, to: toParam });
    const [isUpdating, setIsUpdating] = useState(false);

    // Queries
    const { data: summary, isLoading: isSummaryLoading } = useQuery({
        queryKey: ["reports", "summary", dateRange.from, dateRange.to],
        queryFn: () => fetchSummary(dateRange.from, dateRange.to),
    });

    const { data: topCategories, isLoading: isCategoriesLoading } = useQuery({
        queryKey: ["summary", "top-categories", dateRange.from, dateRange.to],
        queryFn: () => fetchTopCategories(dateRange.from, dateRange.to),
    });

    const { data: topMerchants, isLoading: isMerchantsLoading } = useQuery({
        queryKey: ["summary", "top-merchants", dateRange.from, dateRange.to],
        queryFn: () => fetchTopMerchants(dateRange.from, dateRange.to),
    });

    const { data: balances } = useQuery({
        queryKey: ["summary", "balances"],
        queryFn: fetchBalances,
    });

    const handleUpdate = () => {
        setIsUpdating(true);
        // Update URL
        const params = new URLSearchParams(searchParams);
        params.set("from", dateRange.from);
        params.set("to", dateRange.to);
        router.push(`/?${params.toString()}`);

        // Invalidate queries to trigger refresh
        queryClient.invalidateQueries({ queryKey: ["reports", "summary"] });
        queryClient.invalidateQueries({ queryKey: ["summary", "top-categories"] });
        queryClient.invalidateQueries({ queryKey: ["summary", "top-merchants"] });

        setTimeout(() => setIsUpdating(false), 800);
    };

    const categoryColumns = [
        { header: "Category", accessor: "name" },
        { header: "Count", accessor: "count" },
        {
            header: "Spend",
            accessor: "amount",
            cell: (row) => (
                <span className="font-black text-slate-900">
                    ${row.amount.toLocaleString()}
                </span>
            )
        },
        {
            header: "Share %",
            accessor: "percentage",
            cell: (row) => (
                <div className="flex items-center gap-3 w-full max-w-[120px]">
                    <MiniBar percentage={row.percentage} color="bg-blue-500" />
                    <span className="text-[10px] font-bold text-slate-400 w-8 text-right">{row.percentage}%</span>
                </div>
            )
        },
    ];

    const merchantColumns = [
        { header: "Merchant", accessor: "name" },
        { header: "Count", accessor: "count" },
        {
            header: "Spend",
            accessor: "amount",
            cell: (row) => (
                <span className="font-black text-slate-900">
                    ${row.amount.toLocaleString()}
                </span>
            )
        },
        {
            header: "Share %",
            accessor: "percentage",
            cell: (row) => (
                <div className="flex items-center gap-3 w-full max-w-[120px]">
                    <MiniBar percentage={row.percentage} color="bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-400 w-8 text-right">{row.percentage}%</span>
                </div>
            )
        },
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50 animate-fade-in">
            <TopBar
                title="Dashboard"
                fromDate={dateRange.from}
                toDate={dateRange.to}
                onFromChange={(val) => setDateRange(prev => ({ ...prev, from: val }))}
                onToChange={(val) => setDateRange(prev => ({ ...prev, to: val }))}
                onUpdate={handleUpdate}
                isUpdating={isUpdating}
            />

            <div className="p-6 space-y-6 overflow-y-auto">
                {/* KPI Cards Row */}
                {isSummaryLoading ? (
                    <KpiSkeleton />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KpiCard
                            title="Expenses"
                            primaryValue={`$${summary?.expenses?.total?.toLocaleString() || 0}`}
                            primaryLabel="Total"
                            secondaryValue={`$${summary?.expenses?.avgPerDay?.toLocaleString() || 0}`}
                            secondaryLabel="Avg / Day"
                            tint="blue"
                        />
                        <KpiCard
                            title="Income"
                            primaryValue={`$${summary?.income?.total?.toLocaleString() || 0}`}
                            primaryLabel="Total"
                            secondaryValue={`$${summary?.income?.avgPerDay?.toLocaleString() || 0}`}
                            secondaryLabel="Avg / Day"
                            tint="yellow"
                        />
                        <KpiCard
                            title="Transactions"
                            primaryValue={summary?.transactions?.count || 0}
                            primaryLabel="Count"
                            secondaryValue={summary?.transactions?.topCategory || "N/A"}
                            secondaryLabel="Top Category"
                            tint="purple"
                        />
                        <KpiCard
                            title="Net Cashflow"
                            primaryValue={`$${(summary?.income?.total - summary?.expenses?.total).toLocaleString() || 0}`}
                            primaryLabel="Range"
                            secondaryValue={summary?.income?.total > summary?.expenses?.total ? "Surplus" : "Deficit"}
                            secondaryLabel="Status"
                            tint="green"
                        />
                    </div>
                )}

                {/* Lower Section: Two panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                    <DataPanel title="Top 5 Categories (Spend)" badge="Efficiency">
                        {isCategoriesLoading ? (
                            <TableSkeleton />
                        ) : (
                            <DataTable
                                columns={categoryColumns}
                                data={topCategories || []}
                            />
                        )}
                    </DataPanel>

                    <DataPanel title="Top 5 Merchants (Spend)" badge="Volume">
                        {isMerchantsLoading ? (
                            <TableSkeleton />
                        ) : (
                            <DataTable
                                columns={merchantColumns}
                                data={topMerchants || []}
                            />
                        )}
                    </DataPanel>
                </div>
            </div>
        </div>
    );
}
