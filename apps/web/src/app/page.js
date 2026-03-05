"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { TopBar } from "@/components/TopBar";
import { KpiCard } from "@/components/KpiCard";
import { DataPanel } from "@/components/DataPanel";
import { DataTable } from "@/components/DataTable";
import { MiniBar } from "@/components/MiniBar";
import { KpiSkeleton, TableSkeleton } from "@/components/Skeletons";
import { fetchSummary } from "@/lib/api";
import { ArrowDownRight, Wallet, TrendingUp, HandCoins, ShieldAlert } from "lucide-react";

export default function Dashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const fromParam = searchParams.get("from") || format(startOfMonth(new Date()), "yyyy-MM-dd");
    const toParam = searchParams.get("to") || format(endOfMonth(new Date()), "yyyy-MM-dd");

    const [dateRange, setDateRange] = useState({ from: fromParam, to: toParam });
    const [isUpdating, setIsUpdating] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["reports", "dashboard", dateRange.from, dateRange.to],
        queryFn: () => fetchSummary(dateRange.from, dateRange.to),
    });

    const handleUpdate = () => {
        setIsUpdating(true);
        const params = new URLSearchParams(searchParams);
        params.set("from", dateRange.from);
        params.set("to", dateRange.to);
        router.push(`/?${params.toString()}`);
        queryClient.invalidateQueries({ queryKey: ["reports", "dashboard"] });
        setTimeout(() => setIsUpdating(false), 800);
    };

    const dashboard = data || { summary: {}, tables: {} };
    const summary = dashboard.summary || {};
    const tables = dashboard.tables || {};

    const categoryColumns = [
        { header: "Category", accessor: "name" },
        {
            header: "Expenses",
            accessor: "amount",
            cell: (row) => <span className="font-black text-slate-900">${(row.amount || 0).toLocaleString()}</span>
        },
        {
            header: "Distribution",
            accessor: "percentage",
            cell: (row) => (
                <div className="flex items-center gap-3 w-full">
                    <MiniBar percentage={row.percentage || 0} color="bg-primary" />
                    <span className="text-[10px] font-bold text-slate-400 w-8 text-right">{row.percentage || 0}%</span>
                </div>
            )
        },
    ];

    const merchantColumns = [
        { header: "Entity", accessor: "name" },
        {
            header: "Volume",
            accessor: "amount",
            cell: (row) => <span className="font-black text-slate-900">${(row.amount || 0).toLocaleString()}</span>
        },
        {
            header: "Frequency",
            accessor: "count",
            cell: (row) => <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{row.count || 0} Txns</span>
        }
    ];

    const debtColumns = [
        { header: "Counterparty", accessor: "entity" },
        {
            header: "Type",
            accessor: "kind",
            cell: (row) => (
                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${row.kind === 'PAYABLE' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {row.kind}
                </span>
            )
        },
        {
            header: "Outstanding",
            accessor: "outstandingAmount",
            cell: (row) => (
                <span className={`font-black text-xl tracking-tighter ${row.kind === 'PAYABLE' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ${(row.outstandingAmount || 0).toLocaleString()}
                </span>
            )
        }
    ];

    return (
        <div className="flex flex-col h-full bg-[#FBFDFF] animate-fade-in">
            <TopBar
                title="Financial Strategy"
                fromDate={dateRange.from}
                toDate={dateRange.to}
                onFromChange={(val) => setDateRange(prev => ({ ...prev, from: val }))}
                onToChange={(val) => setDateRange(prev => ({ ...prev, to: val }))}
                onUpdate={handleUpdate}
                isUpdating={isUpdating}
            />

            <div className="p-10 space-y-10 overflow-y-auto">
                {isLoading ? (
                    <KpiSkeleton />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <KpiCard
                            title="Total Amount"
                            primaryValue={summary.totalIncome || 0}
                            primaryLabel="Available Balance"
                            secondaryValue="Stable"
                            secondaryLabel="Capital Health"
                            tint="emerald"
                            icon={<Wallet size={24} />}
                        />
                        <KpiCard
                            title="Total Expenses"
                            primaryValue={summary.totalExpense || 0}
                            primaryLabel="Disbursed Capital"
                            secondaryValue="Active"
                            secondaryLabel="Outflow Status"
                            tint="rose"
                            icon={<ArrowDownRight size={24} />}
                        />
                        <KpiCard
                            title="Top Category"
                            primaryValue={summary.topCategory?.amount || 0}
                            primaryLabel={summary.topCategory?.name || "None Selected"}
                            secondaryValue="Peak Velocity"
                            secondaryLabel="Concentration"
                            tint="blue"
                            icon={<TrendingUp size={24} />}
                        />
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 flex flex-col justify-between min-h-[220px]">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                    <span className="w-1 h-3 rounded-full bg-amber-500" />
                                    Debts Overview
                                </h4>
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                    <ShieldAlert size={24} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Owed (Payable)</div>
                                    <div className="text-2xl font-black text-slate-900 tracking-tighter">${(summary.debts?.payable || 0).toLocaleString()}</div>
                                </div>
                                <div className="border-l border-slate-50 pl-4">
                                    <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Receivable</div>
                                    <div className="text-2xl font-black text-slate-900 tracking-tighter">${(summary.debts?.receivable || 0).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                    <DataPanel title="Top 5 Categories" badge="High Concentration">
                        {isLoading ? <TableSkeleton /> : <DataTable columns={categoryColumns} data={tables.topCategories || []} />}
                    </DataPanel>

                    <DataPanel title="Top 5 Merchants" badge="Volume Core">
                        {isLoading ? <TableSkeleton /> : <DataTable columns={merchantColumns} data={tables.topMerchants || []} />}
                    </DataPanel>

                    <DataPanel title="Top 5 Debts" badge="Active Obligations">
                        {isLoading ? <TableSkeleton /> : <DataTable columns={debtColumns} data={tables.topDebts || []} />}
                    </DataPanel>
                </div>
            </div>
        </div>
    );
}
