"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { KpiCard } from "@/components/KpiCard";
import { DataPanel } from "@/components/DataPanel";
import { DataTable } from "@/components/DataTable";
import { MiniBar } from "@/components/MiniBar";
import { KpiSkeleton, TableSkeleton } from "@/components/Skeletons";
import { fetchSummary } from "@/lib/api";
import { useDateRange } from "@/hooks/useDateRange";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowDownRight, Wallet, TrendingUp, HandCoins,
    ShieldAlert, Activity, CreditCard, ArrowUpRight,
    ChevronRight, Zap, Globe, Cpu, ShieldCheck
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function Dashboard() {
    const { from, to, setFrom, setTo, updateRange, isUpdating } = useDateRange();
    const [viewMode, setViewMode] = useState('ANALYTICS');

    const { data, isLoading } = useQuery({
        queryKey: ["reports", "dashboard", from, to],
        queryFn: () => fetchSummary(from, to),
    });

    const dashboard = data || { summary: {}, tables: {} };
    const summary = dashboard.summary || {};
    const tables = dashboard.tables || {};

    const categoryColumns = [
        { header: "Category", accessor: "name" },
        {
            header: "Amount",
            accessor: "amount",
            cell: (row) => <span className="font-black text-slate-900">PKR {(row.amount || 0).toLocaleString()}</span>
        },
        {
            header: "Spending Share",
            accessor: "percentage",
            cell: (row) => (
                <div className="flex items-center gap-3 w-full">
                    <MiniBar percentage={row.percentage || 0} color="bg-slate-900" />
                    <span className="text-[10px] font-black text-slate-400 w-8 text-right">{row.percentage || 0}%</span>
                </div>
            )
        },
    ];

    const merchantColumns = [
        { header: "Merchant", accessor: "name" },
        {
            header: "Total",
            accessor: "amount",
            cell: (row) => <span className="font-black text-slate-900">PKR {(row.amount || 0).toLocaleString()}</span>
        },
        {
            header: "Visit Count",
            accessor: "count",
            cell: (row) => <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">{row.count || 0} times</span>
        }
    ];

    const debtColumns = [
        { header: "Person", accessor: "entity" },
        {
            header: "Type",
            accessor: "kind",
            cell: (row) => (
                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${row.kind === 'PAYABLE' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {row.kind}
                </span>
            )
        },
        {
            header: "Balance",
            accessor: "outstandingAmount",
            cell: (row) => (
                <span className={`font-black text-lg tracking-tighter ${row.kind === 'PAYABLE' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    PKR {(row.outstandingAmount || 0).toLocaleString()}
                </span>
            )
        }
    ];

    return (
        <div className="flex flex-col min-h-full bg-[#FBFDFF] animate-fade-in relative">
            <TopBar
                title="Overview"
                fromDate={from}
                toDate={to}
                onFromChange={setFrom}
                onToChange={setTo}
                onUpdate={updateRange}
                isUpdating={isUpdating}
            />

            <div className="p-6 lg:p-8 space-y-8 pb-32">
                {/* Visual Identity Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
                    <div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 px-1">Control Center</h4>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-950 tracking-tighter uppercase leading-none">Dashboard</h1>
                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] uppercase tracking-widest px-3 h-6 flex items-center justify-center">System Online</Badge>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 shadow-sm relative overflow-hidden group/nav">
                        {['ANALYTICS', 'STATISTICS'].map(m => (
                            <button
                                key={m} onClick={() => setViewMode(m)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all duration-500 relative z-10",
                                    viewMode === m ? "text-white" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {m}
                                {viewMode === m && (
                                    <motion.div layoutId="dash-pill" className="absolute inset-0 bg-slate-950 rounded-xl -z-10 shadow-lg shadow-slate-950/20" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quantitative Overview Block */}
                {isLoading ? (
                    <KpiSkeleton />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {/* Net Liquidity Matrix */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            className="xl:col-span-1 bg-slate-950 p-8 rounded-3xl text-white flex flex-col justify-between group overflow-hidden relative shadow-3xl shadow-slate-950/30 min-h-[170px]"
                        >
                            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000" />
                            <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-white/5 rounded-full blur-2xl opacity-50" />

                            <div className="flex items-center justify-between relative z-10 mb-4">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Net Assets</h4>
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
                                    <Activity size={16} />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-xs font-black text-slate-500">PKR</span>
                                    <h2 className="text-3xl font-black tracking-tighter leading-none">{(summary.totalIncome - summary.totalExpense).toLocaleString()}</h2>
                                </div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Active Balance
                                </p>
                            </div>
                        </motion.div>

                        <KpiCard
                            title="Total Income"
                            primaryValue={summary.totalIncome || 0}
                            primaryLabel="Received"
                            secondaryValue="Synced"
                            secondaryLabel="Live Update"
                            tint="emerald"
                            icon={<ArrowUpRight size={22} />}
                        />

                        <KpiCard
                            title="Total Expenses"
                            primaryValue={summary.totalExpense || 0}
                            primaryLabel="Spent"
                            secondaryValue="Tracked"
                            secondaryLabel="History"
                            tint="rose"
                            icon={<ArrowDownRight size={22} />}
                        />

                        {/* Liability Summary Block */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/40 flex flex-col justify-between group overflow-hidden relative cursor-pointer hover:shadow-2xl transition-all duration-500 min-h-[170px]"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                <ShieldCheck size={80} />
                            </div>

                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Financial Trust</h4>
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:bg-amber-950 group-hover:text-white transition-all duration-500 shadow-sm border border-amber-100/50">
                                    <ShieldAlert size={18} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6 relative z-10">
                                <div className="flex flex-col space-y-1">
                                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest italic opacity-70">Payables</span>
                                    <span className="text-2xl font-black text-slate-950 tracking-tighter">{(summary.debts?.payable || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col border-l border-slate-100 pl-6 space-y-1">
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic opacity-70">Receivables</span>
                                    <span className="text-2xl font-black text-slate-950 tracking-tighter">{(summary.debts?.receivable || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Global Status Strip */}
                {!isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-6 px-1">
                        <div className="px-8 py-4 bg-white border border-slate-100 rounded-3xl flex items-center gap-4 group hover:translate-y-[-2px] transition-all shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/5 group-hover:bg-slate-950 group-hover:text-white transition-all duration-500">
                                <TrendingUp size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Top Category</p>
                                <p className="text-sm font-black text-slate-950 uppercase tracking-tight">{summary.topCategory?.name || "None"}</p>
                            </div>
                        </div>
                        <div className="px-8 py-4 bg-white border border-slate-100 rounded-3xl flex items-center gap-4 group hover:translate-y-[-2px] transition-all shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-lg shadow-slate-950/20 group-hover:bg-emerald-500 transition-all duration-500">
                                <Wallet size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Net Worth</p>
                                <p className="text-sm font-black text-slate-950 uppercase tracking-tight">PKR {summary.totalAssetBalance?.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl flex items-center gap-3 text-slate-400">
                            <Cpu size={12} className="opacity-50" />
                            <span className="text-[8px] font-black uppercase tracking-[0.4em]">SYSTEM_READY: 100%</span>
                        </div>
                    </motion.div>
                )}

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-20">
                    <DataPanel title="Spending by Category" badge="Analytics">
                        {isLoading ? <TableSkeleton /> : <DataTable columns={categoryColumns} data={tables.topCategories || []} />}
                    </DataPanel>

                    <DataPanel title="Top Merchants" badge="Trends">
                        {isLoading ? <TableSkeleton /> : <DataTable columns={merchantColumns} data={tables.topMerchants || []} />}
                    </DataPanel>

                    <DataPanel title="People & Debts" badge="Active">
                        {isLoading ? <TableSkeleton /> : <DataTable columns={debtColumns} data={tables.topDebts || []} />}
                    </DataPanel>
                </div>
            </div>

            {/* Global Encryption Footer */}
            <div className="mt-auto px-10 py-8 border-t border-slate-50 bg-[#FBFDFF] flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6 overflow-hidden relative">
                <div className="flex items-center gap-4 relative z-10">
                    <Globe size={16} className="text-slate-200" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Personal Finance Dashboard // Secure Analytics</p>
                </div>
            </div>
        </div>
    );
}
