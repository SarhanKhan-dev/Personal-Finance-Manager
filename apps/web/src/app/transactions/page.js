"use client";

import { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import {
    Calendar,
    Building2,
    Zap,
    ArrowUpCircle,
    ArrowDownCircle,
    CheckCircle2,
    Search,
    Filter,
    Download,
    Ban,
    ArrowRightLeft,
    MoreHorizontal,
    Loader2,
    ShieldCheck,
    History,
    Folder,
    Plus
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

import { useDateRange } from "@/hooks/useDateRange";
import { fetchTransactions, voidTransaction } from "@/lib/api";
import { cn } from "@/lib/utils";

import { TopBar } from "@/components/TopBar";
import { KpiCard } from "@/components/KpiCard";
import TransactionModal from "@/components/TransactionModal";
import { Button, Badge } from "@/components/ui";


export default function TransactionsPage() {
    const queryClient = useQueryClient();
    const { from, to, setFrom, setTo, updateRange, isUpdating } = useDateRange();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ['transactions', from, to, filterType, search],
        queryFn: () => fetchTransactions({ from, to, type: filterType, search })
    });

    const voidMutation = useMutation({
        mutationFn: voidTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['owners'] });
        },
        onError: (err) => alert("Void failed: " + err.message)
    });

    const transactions = data?.transactions || [];
    const summary = data?.summary || { totalVolume: 0, outflow: 0, inflow: 0, count: 0 };

    if (isLoading && !transactions.length) {
        return (
            <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-8">
                <div className="relative">
                    <div className="w-16 h-16 rounded-[1.5rem] border-4 border-slate-100 border-t-slate-900 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <History className="text-slate-900 animate-pulse" size={24} />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-slate-950 font-black uppercase tracking-[0.5em] text-[10px]">Loading Transactions</p>
                    <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.3em] italic">Fetching your transaction history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full bg-[#FBFDFF] animate-fade-in relative">
            <TopBar
                title="Transactions"
                fromDate={from}
                toDate={to}
                onFromChange={setFrom}
                onToChange={setTo}
                onUpdate={updateRange}
                isUpdating={isUpdating}
            />

            <div className="p-6 lg:p-8 space-y-8 pb-32">
                {/* Visual Identity Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 px-1">Ledger History</h4>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-950 tracking-tighter uppercase leading-none">Transactions</h1>
                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] uppercase tracking-widest px-3 h-6 flex items-center justify-center">Live Feed</Badge>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="h-12 px-8 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-950/20 gap-3 hover:translate-y-[-2px] active:scale-95 transition-all text-xs border-none"
                    >
                        <Plus size={18} /> New Transaction
                    </Button>
                </div>

                {/* Metrics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <KpiCard title="Overall" primaryValue={summary.totalVolume} primaryLabel="Total Moved" secondaryValue={`${transactions.length} items`} secondaryLabel="Count" tint="blue" icon={<Zap size={20} />} />
                    <KpiCard title="Total Income" primaryValue={summary.inflow} primaryLabel="Money In" secondaryValue="System" secondaryLabel="Source" tint="emerald" icon={<ArrowUpCircle size={20} />} />
                    <KpiCard title="Total Expenses" primaryValue={summary.outflow} primaryLabel="Money Out" secondaryValue="Budget" secondaryLabel="Target" tint="rose" icon={<ArrowDownCircle size={20} />} />

                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between group cursor-pointer hover:shadow-2xl transition-all duration-700 shadow-xl shadow-slate-200/40 min-h-[170px]"
                    >
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Ledger Security</h4>
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shadow-sm border border-emerald-100/50 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                                <CheckCircle2 size={18} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <p className="text-xl font-black text-slate-950 tracking-tighter uppercase">Protected</p>
                            </div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1 italic pl-4">Double-entry verification active</p>
                        </div>
                    </motion.div>
                </div>

                {/* Control Layer */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30">
                    <div className="relative flex-1 w-full group/search">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-slate-950 transition-all">
                            <Search size={20} />
                        </div>
                        <input
                            type="text" placeholder="Search transactions..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full h-14 pl-16 pr-6 bg-slate-50 border-none rounded-2xl text-[11px] font-black text-slate-900 uppercase tracking-widest placeholder:text-slate-200 focus:bg-white focus:ring-4 focus:ring-slate-950/5 transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="relative min-w-[200px]">
                            <select
                                value={filterType} onChange={e => setFilterType(e.target.value)}
                                className="w-full h-14 px-6 bg-slate-50 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 outline-none border-none focus:ring-4 focus:ring-slate-950/5 hover:bg-slate-100 transition-all cursor-pointer appearance-none"
                            >
                                <option value="">All Types</option>
                                <option value="EXPENSE">Expenses</option>
                                <option value="INCOME">Income</option>
                                <option value="ASSET_TRANSFER">Transfers</option>
                                <option value="LOAN_GIVEN">Lent</option>
                                <option value="LOAN_RECEIVED">Borrowed</option>
                            </select>
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Filter size={14} className="text-slate-300" />
                            </div>
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
                            <h2 className="text-base font-black text-slate-950 uppercase tracking-[0.3em] leading-none">Recent Activity</h2>
                            <p className="text-[9px] font-black text-slate-300 uppercase mt-2 tracking-widest italic leading-none ml-1">List of all transactions</p>
                        </div>
                        <Button variant="ghost" className="h-10 px-6 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-950 transition-all border border-transparent hover:border-slate-100">
                            <Download size={14} className="mr-2" /> Export CSV
                        </Button>
                    </div>

                    <div className="overflow-x-auto CustomScrollbar">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="pl-8 pr-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Description</th>
                                    <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Account</th>
                                    <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                                    <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Amount</th>
                                    <th className="pl-6 pr-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={5} className="py-48 text-center bg-white">
                                            <div className="flex flex-col items-center justify-center space-y-8">
                                                <div className="w-24 h-24 rounded-[3rem] bg-slate-50 flex items-center justify-center text-slate-200">
                                                    <Ban size={48} />
                                                </div>
                                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">No transactions found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {transactions.map((t, idx) => {
                                    const isVoided = t.status === 'VOIDED';
                                    const isIncome = t.type === 'INCOME' || t.type === 'LOAN_RECEIVED';
                                    const isTransfer = t.type.includes('TRANSFER');
                                    const isPositive = isIncome;

                                    const Icon = isVoided ? Ban : (isPositive ? ArrowUpCircle : (isTransfer ? ArrowRightLeft : ArrowDownCircle));
                                    const colorClass = isVoided ? "text-slate-300 bg-slate-100" : (isPositive ? "text-emerald-600 bg-emerald-50" : (isTransfer ? "text-blue-600 bg-blue-50" : "text-rose-600 bg-rose-50"));

                                    let title = t.description;
                                    if (!title) {
                                        if (t.merchant) title = t.merchant.name;
                                        else if (t.person) title = t.person.name;
                                        else title = 'No Description';
                                    }

                                    return (
                                        <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className={cn("group transition-all duration-500", isVoided ? "opacity-30 grayscale" : "hover:bg-slate-50/80")}>
                                            <td className="pl-8 pr-6 py-6">
                                                <div className="flex items-center gap-6">
                                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-transparent group-hover:scale-110 group-hover:rotate-1 group-hover:shadow-2xl transition-all duration-700", colorClass, !isVoided && "group-hover:border-white/50")}>
                                                        <Icon size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-950 tracking-tighter text-lg uppercase truncate max-w-[280px] leading-tight group-hover:translate-x-1 transition-transform duration-500">{title}</div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                                                                <Calendar size={8} className="text-slate-400" />
                                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{format(new Date(t.occurredAt), 'dd MMM yyyy')}</span>
                                                            </div>
                                                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest italic">{format(new Date(t.createdAt), 'HH:mm')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm group-hover:border-slate-300 transition-all duration-500">
                                                    <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-900 shadow-inner">
                                                        <Building2 size={12} />
                                                    </div>
                                                    <span className="font-black text-slate-950 tracking-[0.1em] text-[8px] uppercase">{t.asset?.name || 'CASH'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col gap-2">
                                                    <Badge className="bg-slate-950 border-none text-white font-black px-3 py-1 rounded-md uppercase tracking-[0.1em] text-[7px] w-fit shadow-lg shadow-slate-900/10">
                                                        {t.type.replace('_', ' ')}
                                                    </Badge>
                                                    <div className="flex items-center gap-1.5 pl-0.5">
                                                        <Folder size={8} className="text-slate-300" />
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.category?.name || (t.person ? 'Liaison' : 'General')}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="inline-flex flex-col items-end px-5 py-4 rounded-3xl min-w-[160px] border border-transparent group-hover:border-white transition-all duration-500" />
                                                <div className={cn("inline-flex flex-col items-end px-5 py-4 rounded-3xl min-w-[160px] border border-transparent group-hover:border-white transition-all duration-500", isVoided ? "bg-slate-50" : (isPositive ? 'bg-emerald-50/50 shadow-emerald-500/5' : (isTransfer ? 'bg-slate-100/50' : 'bg-rose-50/50 shadow-rose-500/5')))}>
                                                    <div className={cn("font-black tracking-tighter text-xl", isVoided ? "text-slate-300 line-through" : (isPositive ? 'text-emerald-700' : (isTransfer ? 'text-slate-950' : 'text-rose-700')))}>
                                                        <span className="text-[10px] font-black mr-1 opacity-30 text-slate-900">PKR</span>
                                                        {isPositive ? '+' : (isTransfer ? '' : '-')}{Math.abs(t.totalAmount).toLocaleString()}
                                                    </div>
                                                    {!isVoided && <p className="text-[7px] font-black text-slate-400 uppercase mt-1 tracking-widest opacity-60 italic text-right w-full">Verified Amount</p>}
                                                    {isVoided && <span className="text-[7px] font-black text-rose-500 uppercase mt-1 tracking-[0.2em]">REVERSED</span>}
                                                </div>
                                            </td>
                                            <td className="pl-6 pr-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                                                    {!isVoided && (
                                                        <button
                                                            onClick={() => {
                                                                if (confirm("Reversing this transaction cannot be undone. Confirm reversal?")) {
                                                                    voidMutation.mutate(t.id);
                                                                }
                                                            }}
                                                            disabled={voidMutation.isPending}
                                                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-slate-300 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-xl shadow-slate-200/50 active:scale-90 group/void"
                                                            title="Reverse Transaction"
                                                        >
                                                            {voidMutation.isPending && voidMutation.variables === t.id ? (
                                                                <Loader2 size={16} className="animate-spin" />
                                                            ) : (
                                                                <Ban size={16} />
                                                            )}
                                                        </button>
                                                    )}
                                                    <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-slate-300 hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all shadow-xl shadow-slate-200/50 active:scale-90">
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-12 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] flex items-center gap-4 italic pl-4">
                            <ShieldCheck size={14} className="text-emerald-500" /> TRANSACTION_PROTECTION_ENABLED
                        </p>
                    </div>
                </motion.div>
            </div>

            <TransactionModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={() => setIsCreateOpen(false)}
            />
        </div>
    );
}
