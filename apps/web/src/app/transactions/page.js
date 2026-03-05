"use client";

import {
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    ArrowRightLeft,
    Calendar,
    Download,
    Wallet,
    Loader2,
    ChevronRight,
    ArrowUpCircle,
    ArrowDownCircle,
    Repeat,
    Trash2,
    Plus,
    X,
    Folder
} from "lucide-react";
import { Card, Input, Button, Badge } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTransactions, deleteTransaction } from "@/lib/api";
import { format } from "date-fns";
import { TopBar } from "@/components/TopBar";
import { KpiCard } from "@/components/KpiCard";
import { useState } from "react";
import TransactionModal from "@/components/TransactionModal";

export default function Transactions() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Date Range State
    const [dateRange, setDateRange] = useState({
        from: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"), // Start of current month
        to: format(new Date(), "yyyy-MM-dd") // Today
    });

    const { data, isLoading } = useQuery({
        queryKey: ['transactions', dateRange.from, dateRange.to],
        queryFn: () => fetchTransactions(dateRange.from, dateRange.to)
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['summary'] });
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        }
    });

    const transactions = data?.transactions || [];
    const summary = data?.summary || { totalVolume: 0, outflow: 0, inflow: 0, count: 0 };

    if (isLoading) {
        return (
            <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-3xl border-4 border-slate-100 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="text-primary" size={24} />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-slate-900 font-black uppercase tracking-[0.3em] text-xs mb-1">Retrieving Ledger</p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Accessing encrypted archives...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#FBFDFF] animate-fade-in relative">
            <TopBar
                title="Transactions Ledger"
                fromDate={dateRange.from}
                toDate={dateRange.to}
                onFromChange={(val) => setDateRange(prev => ({ ...prev, from: val }))}
                onToChange={(val) => setDateRange(prev => ({ ...prev, to: val }))}
                onUpdate={() => queryClient.invalidateQueries({ queryKey: ['transactions'] })}
            />

            <div className="p-10 space-y-10 overflow-y-auto pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <KpiCard title="Total Volume" value={summary.totalVolume} subValue={`${data?.count || summary.count} entries`} tint="blue" />
                    <KpiCard title="Total Inflow" value={summary.inflow} subValue="Income recorded" tint="emerald" />
                    <KpiCard title="Total Outflow" value={summary.outflow} subValue="Expenses posted" tint="rose" />
                    <KpiCard title="Active Ledger" value={data?.count || summary.count} subValue="Live entries" tint="amber" isCurrency={false} />
                </div>

                <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
                    <div className="relative w-full xl:w-[450px] group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-all duration-300" size={18} />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="w-full h-14 pl-14 pr-6 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-300 shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full xl:w-auto">
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="h-14 px-8 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 gap-3"
                        >
                            <Plus size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Post Entry</span>
                        </Button>
                        <Button variant="outline" className="h-14 px-8 border-slate-100 rounded-2xl shadow-sm gap-3">
                            <Filter size={16} className="text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
                        </Button>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-50/30">
                                    <th className="pl-10 pr-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Transaction Entity</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Method</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Valuation</th>
                                    <th className="pl-6 pr-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <Folder size={48} className="mb-4 opacity-50" />
                                                <p className="text-sm font-black uppercase tracking-widest">No transactions found</p>
                                                <p className="text-[10px] uppercase tracking-wider mt-2">Try adjusting your date range filter</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {transactions.map((t, idx) => {
                                    const isIncome = t.type === 'INCOME';
                                    const isExpense = t.type === 'EXPENSE';
                                    const isTransfer = t.type.includes('TRANSFER');
                                    const isLoanReceive = t.type === 'LOAN_RECEIVED';
                                    const isPositive = isIncome || isLoanReceive;

                                    const Icon = isPositive ? ArrowUpCircle : (isTransfer ? Repeat : ArrowDownCircle);
                                    const colorClass = isPositive ? "text-emerald-500 bg-emerald-50" : (isTransfer ? "text-blue-500 bg-blue-50" : "text-rose-500 bg-rose-50");

                                    let title = t.description;
                                    if (!title) {
                                        if (t.merchant) title = t.merchant.name;
                                        else if (t.person) title = t.person.name + (isLoanReceive ? ' (Loan Received)' : ' (Loan Given)');
                                        else title = 'System Entry';
                                    }

                                    return (
                                        <motion.tr key={t.id} className="group hover:bg-slate-50/50 transition-all">
                                            <td className="pl-10 pr-6 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-500", colorClass)}>
                                                        <Icon size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 tracking-tight text-lg uppercase truncate max-w-[200px]">{title}</div>
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{format(new Date(t.occurredAt), 'MMMM dd, yyyy')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
                                                    <Wallet size={14} className="text-slate-400" />
                                                    <span className="font-black text-slate-500 tracking-widest text-[10px] uppercase truncate max-w-[120px]">{t.asset?.name || 'Instrument'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <Badge variant="default" className="bg-slate-50 border-none text-slate-400 font-black px-4 py-2 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all uppercase tracking-wider text-[9px]">
                                                    {t.category?.name || (t.type.includes('LOAN') ? 'DEBT' : 'UNCATEGORIZED')}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-8 text-right">
                                                <div className={cn("inline-flex flex-col items-end px-6 py-3 rounded-2xl", isPositive ? 'bg-emerald-50/50' : (isTransfer ? 'bg-blue-50/50' : 'bg-rose-50/50'))}>
                                                    <div className={cn("font-black tracking-tighter text-2xl", isPositive ? 'text-emerald-600' : (isTransfer ? 'text-blue-600' : 'text-rose-600'))}>
                                                        <span className="text-xs font-black mr-1 opacity-40">PKR</span>
                                                        {isPositive ? '+' : '-'}{Math.abs(t.totalAmount).toLocaleString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="pl-6 pr-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-2 text-slate-300">
                                                    <button
                                                        onClick={() => deleteMutation.mutate(t.id)}
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95 group/del"
                                                    >
                                                        {deleteMutation.isPending && deleteMutation.variables === t.id ? (
                                                            <Loader2 size={18} className="animate-spin text-rose-500" />
                                                        ) : (
                                                            <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Custom Modal for Posting */}
            <TransactionModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={() => {
                    setIsCreateOpen(false);
                    // Query invalidation happens in Modal
                }}
            />
        </div>
    );
}

