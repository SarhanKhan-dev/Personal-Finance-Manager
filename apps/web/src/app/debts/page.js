"use client";

import { useState } from "react";
import {
    Users, Search, Plus, Loader2, UserCircle, ChevronRight,
    ArrowUpRight, ArrowDownLeft, HandCoins, Activity,
    PieChart, Wallet, ShieldAlert, Zap, Globe, ShieldCheck, History
} from "lucide-react";
import { Button, Input, Label, Badge } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchReceivables, fetchPayables, fetchDebtsSummary } from "@/lib/api";
import { TopBar } from "@/components/TopBar";
import { KpiCard } from "@/components/KpiCard";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useDateRange } from "@/hooks/useDateRange";

export default function DebtsPage() {
    const { from, to, setFrom, setTo, updateRange, isUpdating } = useDateRange();
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState('RECEIVABLES'); // RECEIVABLES, PAYABLES

    const { data: summary, isLoading: isSummaryLoading } = useQuery({
        queryKey: ['debts-summary'],
        queryFn: fetchDebtsSummary
    });

    const { data: receivablesData, isLoading: isRecLoading } = useQuery({
        queryKey: ['debts-receivables', search],
        queryFn: () => fetchReceivables(1, 100),
        enabled: activeTab === 'RECEIVABLES'
    });

    const { data: payablesData, isLoading: isPayLoading } = useQuery({
        queryKey: ['debts-payables', search],
        queryFn: () => fetchPayables(1, 100),
        enabled: activeTab === 'PAYABLES'
    });

    const isLoading = isSummaryLoading || (activeTab === 'RECEIVABLES' ? isRecLoading : isPayLoading);
    const items = activeTab === 'RECEIVABLES' ? (receivablesData?.items || []) : (payablesData?.items || []);

    const filteredItems = items.filter(i =>
        i.personName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-full bg-[#FBFDFF] animate-fade-in relative">
            <TopBar
                title="Debts & Loans"
                fromDate={from}
                toDate={to}
                onFromChange={setFrom}
                onToChange={setTo}
                onUpdate={updateRange}
                isUpdating={isUpdating}
            />

            <div className="p-6 lg:p-8 space-y-8 pb-32">
                {/* Visual Identity Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 px-1">Commitments</h4>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-950 tracking-tighter uppercase leading-none">Debts</h1>
                            <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[9px] uppercase tracking-widest px-3 h-7 flex items-center justify-center">TRACKED</Badge>
                        </div>
                    </div>
                    <Link href="/people">
                        <Button className="h-18 px-10 rounded-[2rem] bg-slate-950 text-white font-black uppercase tracking-[0.3em] shadow-3xl shadow-slate-950/20 gap-4 hover:translate-y-[-2px] active:scale-95 transition-all text-sm border-none">
                            <Plus size={24} /> Add Person
                        </Button>
                    </Link>
                </div>

                {/* Quantitative Overview Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <KpiCard
                        title="Owed to me"
                        primaryValue={summary?.totalReceivableOutstanding || 0}
                        primaryLabel="Total Outstanding Recovery"
                        secondaryValue={summary?.totalReceivable || 0}
                        secondaryLabel="Total Amount Lent"
                        tint="emerald"
                        icon={<ArrowUpRight size={28} />}
                    />
                    <KpiCard
                        title="I owe to others"
                        primaryValue={summary?.totalPayableOutstanding || 0}
                        primaryLabel="Total Outstanding Debt"
                        secondaryValue={summary?.totalPayable || 0}
                        secondaryLabel="Total Amount Borrowed"
                        tint="rose"
                        icon={<ArrowDownLeft size={28} />}
                    />

                    {/* Visual context cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-100 rounded-[4rem] p-10 shadow-xl shadow-slate-200/40 flex flex-col justify-between group hover:shadow-2xl transition-all duration-500 overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <History size={100} />
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-900 border border-slate-100 flex items-center justify-center shadow-sm">
                                <Activity size={24} />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Net Balance</h4>
                        </div>
                        <div className="mt-8 relative z-10">
                            <div className={cn(
                                "text-4xl font-black tracking-tighter leading-none mb-1",
                                (summary?.totalReceivableOutstanding - summary?.totalPayableOutstanding) >= 0 ? "text-emerald-600" : "text-rose-600"
                            )}>
                                PKR {Math.abs(summary?.totalReceivableOutstanding - summary?.totalPayableOutstanding || 0).toLocaleString()}
                            </div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">
                                {(summary?.totalReceivableOutstanding - summary?.totalPayableOutstanding) >= 0 ? 'Surplus Equilibrium' : 'Action Required'}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        className="xl:col-span-1 bg-slate-950 p-8 rounded-3xl text-white flex flex-col justify-between group overflow-hidden relative shadow-3xl shadow-slate-950/30 min-h-[170px]"
                    >
                        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-1000" />

                        <div className="flex items-center justify-between relative z-10 mb-4">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Summary</h4>
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                <Activity size={16} />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-xs font-black text-slate-500 uppercase">Owed</span>
                                <h2 className="text-3xl font-black tracking-tighter leading-none">{summary?.receivable?.toLocaleString()}</h2>
                            </div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Recoverable items</p>
                        </div>
                    </motion.div>
                </div>

                {/* Operations Control Matrix */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30">
                    <div className="flex p-2 bg-slate-100 rounded-[1.75rem] gap-2 border border-slate-200/50">
                        {['RECEIVABLES', 'PAYABLES'].map(m => (
                            <button
                                key={m} onClick={() => setActiveTab(m)}
                                className={cn(
                                    "px-10 py-4 rounded-2xl transition-all duration-500 text-[10px] font-black uppercase tracking-[0.3em] relative z-10",
                                    activeTab === m ? "text-white" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {m}
                                {activeTab === m && (
                                    <motion.div layoutId="debt-pill" className="absolute inset-0 bg-slate-950 rounded-2xl -z-10 shadow-lg shadow-slate-950/20" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-6 flex-1 max-w-2xl group/search">
                        <div className="relative flex-1">
                            <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-slate-950 transition-all">
                                <Search size={22} />
                            </div>
                            <input
                                type="text" placeholder="Search by name..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full h-18 pl-20 pr-8 bg-slate-50 border-none rounded-[1.75rem] text-sm font-black text-slate-900 uppercase tracking-widest placeholder:text-slate-200 focus:bg-white focus:ring-8 focus:ring-slate-950/5 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Records Table */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-100 shadow-4xl shadow-slate-200/50 rounded-3xl overflow-hidden"
                >
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white relative">
                        <div className="absolute top-0 left-0 w-16 h-1 bg-slate-950" />
                        <div>
                            <h2 className="text-base font-black text-slate-950 uppercase tracking-[0.3em] leading-none">Relations</h2>
                            <p className="text-[9px] font-black text-slate-300 uppercase mt-2 tracking-widest italic leading-none ml-1">Track specific people</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto CustomScrollbar">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="pl-8 pr-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Name</th>
                                    <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Owe Them</th>
                                    <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Owe You</th>
                                    <th className="pl-6 pr-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Net</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="py-48 text-center bg-white">
                                            <div className="flex flex-col items-center justify-center space-y-6">
                                                <div className="w-20 h-20 rounded-[2rem] border-8 border-slate-50 border-t-slate-950 animate-spin" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Synchronizing Records...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-48 text-center bg-white">
                                            <div className="flex flex-col items-center justify-center space-y-8">
                                                <div className="w-24 h-24 rounded-[3rem] bg-slate-50 flex items-center justify-center text-slate-200">
                                                    <PieChart size={48} />
                                                </div>
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">No records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredItems.map((p, idx) => (
                                    <motion.tr
                                        key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-slate-50/80 transition-all duration-500 cursor-pointer"
                                        onClick={() => window.location.href = `/debts/${p.id}`}
                                    >
                                        <td className="pl-8 pr-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-slate-950/20 group-hover:scale-110 transition-transform">
                                                    {p.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-950 tracking-tighter text-base uppercase leading-tight group-hover:translate-x-1 transition-transform duration-500">{p.name}</div>
                                                    <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">ACTIVE RELATION</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="font-black text-rose-600 tracking-tighter text-base">PKR {Number(p.payable || 0).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="font-black text-emerald-600 tracking-tighter text-base">PKR {Number(p.receivable || 0).toLocaleString()}</span>
                                        </td>
                                        <td className="pl-6 pr-8 py-6 text-right">
                                            <div className={cn(
                                                "px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm inline-block",
                                                (Number(p.receivable || 0) === Number(p.payable || 0))
                                                    ? 'bg-emerald-950 text-white border-none'
                                                    : 'bg-white text-slate-900 border-slate-100'
                                            )}>
                                                {(Number(p.receivable || 0) === Number(p.payable || 0)) ? 'Settle' : 'Balance'}
                                            </div>
                                        </td>
                                        <td className="pl-8 pr-12 py-10 text-right">
                                            <Link href={`/debts/person/${p.personId || p.id}`}>
                                                <button className="h-14 w-14 rounded-[1.25rem] bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all shadow-xl shadow-slate-200/50 group/btn active:scale-90">
                                                    <ChevronRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </Link>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-12 bg-slate-950/2 flex items-center justify-between border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] flex items-center gap-4 italic pl-4">
                            <ShieldCheck size={14} className="text-emerald-500" /> SECURE_DEBT_LEDGER_SYNCED
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
