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
    X
} from "lucide-react";
import { Card, Input, Button, Badge } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTransactions, deleteTransaction, createTransaction } from "@/lib/api";
import { format } from "date-fns";
import { TopBar } from "@/components/TopBar";
import { KpiCard } from "@/components/KpiCard";
import { useState } from "react";

export default function Transactions() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: fetchTransactions
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
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
                title="Transactions"
                fromDate={format(new Date(), "yyyy-MM-dd")}
                toDate={format(new Date(), "yyyy-MM-dd")}
                onFromChange={() => { }}
                onToChange={() => { }}
                onUpdate={() => { }}
            />

            <div className="p-10 space-y-10 overflow-y-auto pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <KpiCard title="Total Volume" value={summary.totalVolume} subValue={`${summary.count} entries`} tint="blue" />
                    <KpiCard title="Total Inflow" value={summary.inflow} subValue="Income recorded" tint="emerald" />
                    <KpiCard title="Total Outflow" value={summary.outflow} subValue="Expenses posted" tint="rose" />
                    <KpiCard title="Active Ledger" value={summary.count} subValue="Live entries" tint="amber" isCurrency={false} />
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
                                    <th className="pl-10 pr-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Transaction Entity</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Method</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Category</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 text-right">Valuation</th>
                                    <th className="pl-6 pr-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 text-right">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.map((t, idx) => {
                                    const isPositive = t.type === 'INCOME';
                                    const isTransfer = t.type.includes('TRANSFER');
                                    const Icon = isPositive ? ArrowUpCircle : (isTransfer ? Repeat : ArrowDownCircle);
                                    const colorClass = isPositive ? "text-emerald-500 bg-emerald-50" : (isTransfer ? "text-blue-500 bg-blue-50" : "text-rose-500 bg-rose-50");

                                    return (
                                        <motion.tr key={t.id} className="group hover:bg-slate-50/50 transition-all">
                                            <td className="pl-10 pr-6 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-500", colorClass)}>
                                                        <Icon size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 tracking-tight text-lg uppercase">{t.merchant?.name || t.description || 'System Entry'}</div>
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{format(new Date(t.occurredAt), 'MMMM dd, yyyy')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
                                                    <Wallet size={14} className="text-slate-400" />
                                                    <span className="font-black text-slate-500 tracking-widest text-[10px] uppercase">{t.asset?.name || 'Instrument'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <Badge variant="default" className="bg-slate-50 border-none text-slate-400 font-black px-4 py-2 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                    {t.category?.name || 'UNCATEGORIZED'}
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
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => deleteMutation.mutate(t.id)}
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                    <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95">
                                                        <ChevronRight size={18} />
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

            {/* QUICK POST OVERLAY (MOCK) */}
            <AnimatePresence>
                {isCreateOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-3xl relative"
                        >
                            <button onClick={() => setIsCreateOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
                                <X size={24} />
                            </button>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-8">Post New Entry</h2>
                            <div className="space-y-6 text-center py-20">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <Plus size={40} />
                                </div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Form implementation pending specialized layout</p>
                                <Button onClick={() => setIsCreateOpen(false)} className="bg-slate-900 text-white w-full h-14 rounded-2xl">Close Protocol</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
