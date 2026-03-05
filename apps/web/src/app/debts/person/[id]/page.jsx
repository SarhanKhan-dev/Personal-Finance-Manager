"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPersonTimeline } from "@/lib/api";
import {
    User, UserCircle, Calendar, ArrowUpRight, ArrowDownLeft,
    Loader2, ChevronLeft, Phone, ShieldCheck, Activity,
    History, Wallet, Receipt
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function PersonTimelinePage() {
    const { id } = useParams();

    const { data, isLoading } = useQuery({
        queryKey: ['person-timeline', id],
        queryFn: () => fetchPersonTimeline(id),
    });

    if (isLoading && !data) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center gap-6 bg-slate-50">
                <div className="w-20 h-20 rounded-3xl border-4 border-slate-100 border-t-slate-900 animate-spin" />
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Compiling Individual Ledger...</p>
            </div>
        );
    }

    const { person, timeline = [] } = data || {};

    // Calculate total net position with this person
    const netPosition = timeline.reduce((acc, item) => {
        if (item.type === 'DEBT') {
            return acc + (item.kind === 'RECEIVABLE' ? item.outstandingAmount : -item.outstandingAmount);
        }
        return acc;
    }, 0);

    return (
        <div className="flex flex-col h-full bg-[#f9fbff] animate-fade-in relative CustomScrollbar overflow-y-auto pb-32">
            {/* Header / Profile Strip */}
            <div className="bg-slate-950 p-12 lg:p-20 relative overflow-hidden group">
                <div className="absolute top-[-30%] right-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] group-hover:scale-110 transition-transform duration-1000" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
                    <div className="flex items-center gap-8">
                        <Link href="/debts">
                            <button className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl">
                                <ChevronLeft size={28} />
                            </button>
                        </Link>
                        <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/10 flex items-center justify-center text-white text-4xl font-black shadow-2xl">
                            {person?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">{person?.name}</h1>
                            <div className="flex items-center gap-6">
                                <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <Phone size={12} className="text-slate-600" />
                                    {person?.phone || "UNLINKED"}
                                </span>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <ShieldCheck size={12} className="text-emerald-500" />
                                    SYNCED ENTITY
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 min-w-[300px] flex flex-col justify-between overflow-hidden relative group/pos">
                        <div className="absolute top-0 right-0 p-4 opacity-20"><Activity size={48} className="text-white" /></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Liaison Position (NET)</p>
                            <h2 className={cn("text-4xl font-black tracking-tighter", netPosition >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                <span className="text-sm text-slate-500 mr-2">PKR</span>
                                {Math.abs(netPosition).toLocaleString()}
                            </h2>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">
                                {netPosition >= 0 ? 'Surplus Due To You' : 'Obligation Due To Entity'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Section */}
            <div className="p-10 lg:p-20 max-w-6xl mx-auto space-y-12">
                <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                            <History size={20} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 leading-none">Individual Protocol Log</h3>
                    </div>
                    <Badge className="bg-slate-900 border-none text-white font-black px-4 py-2 uppercase tracking-widest text-[9px] h-8 rounded-lg">{timeline.length} Logs</Badge>
                </div>

                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-[31px] top-4 bottom-4 w-0.5 bg-slate-100" />

                    <div className="space-y-16 relative">
                        {timeline.length === 0 ? (
                            <div className="py-20 text-center">
                                <Receipt size={80} className="mx-auto text-slate-100 mb-6" />
                                <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">Operational Void: No Transactions Detected</p>
                            </div>
                        ) : timeline.map((item, i) => {
                            const isTransaction = item.sourceType === 'TRANSACTION';
                            const isDebt = item.sourceType === 'DEBT';
                            const isOutflow = (isTransaction && (item.type === 'EXPENSE' || item.type === 'LOAN_GIVEN' || (item.type === 'ASSET_TRANSFER' && item.totalAmount < 0))) ||
                                (isDebt && item.kind === 'PAYABLE');

                            const Icon = isDebt ? ShieldCheck : (isOutflow ? ArrowDownLeft : ArrowUpRight);
                            const colorClass = isOutflow ? "text-rose-500 bg-rose-50 border-rose-100" : "text-emerald-500 bg-emerald-50 border-emerald-100";

                            return (
                                <motion.div
                                    key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-12 group cursor-default"
                                >
                                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border-2 z-10 transition-all duration-500 group-hover:scale-110", colorClass)}>
                                        <Icon size={28} />
                                    </div>

                                    <div className="flex-1 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all border-l-4 border-l-slate-900">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{format(new Date(item.occurredAt), 'dd MMM yyyy')}</span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-100" />
                                                    <span className="px-2 py-0.5 bg-slate-50 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.sourceType}</span>
                                                </div>
                                                <h4 className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none">{item.description || item.type?.replace('_', ' ')}</h4>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Wallet size={10} />
                                                        {item.assetName || "Internal Ledger"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-left lg:text-right">
                                                <div className={cn("text-3xl font-black tracking-tighter", isOutflow ? "text-rose-600" : "text-emerald-600")}>
                                                    <span className="text-sm font-black mr-1 opacity-40">PKR</span>
                                                    {Math.abs(item.totalAmount || item.principalAmount).toLocaleString()}
                                                </div>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">{item.type || item.kind} PROTOCOL</p>
                                            </div>
                                        </div>

                                        {/* Meta Data Expansion */}
                                        <div className="mt-8 pt-6 border-t border-slate-50 flex flex-wrap gap-4 opacity-0 group-hover:opacity-100 transition-all">
                                            <div className="px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest">TXID: {item.sourceId?.substring(0, 12)}...</div>
                                            {item.categoryName && <div className="px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest">CATEGORY: {item.categoryName}</div>}
                                            {item.merchantName && <div className="px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest">VENDOR: {item.merchantName}</div>}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer Control */}
            <div className="mt-auto px-10 py-6 border-t border-slate-50 bg-[#f9fbff]/50 text-center">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Entity Ledger Finalized - INTEGRITY VERIFIED</p>
            </div>
        </div>
    );
}
