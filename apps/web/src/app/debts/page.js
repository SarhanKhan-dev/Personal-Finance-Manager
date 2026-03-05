"use client";

import {
    Users,
    Search,
    Plus,
    Loader2,
    ShieldCheck,
    Trash2,
    Edit3,
    X,
    HandCoins,
    UserCircle,
    ArrowUpRight
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDebts, createDebt, updateDebt, deleteDebt } from "@/lib/api";
import { TopBar } from "@/components/TopBar";
import { KpiCard } from "@/components/KpiCard";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Debts() {
    const queryClient = useQueryClient();
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
    const [formData, setFormData] = useState({ personId: '', kind: 'RECEIVABLE', principalAmount: 0 });

    const { data, isLoading } = useQuery({
        queryKey: ['debts'],
        queryFn: fetchDebts
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDebt,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['debts'] });
        }
    });

    const debts = data?.debts || [];
    const summary = data?.summary || {
        receivablePrincipal: 0,
        receivableOutstanding: 0,
        payablePrincipal: 0,
        payableOutstanding: 0
    };

    if (isLoading) {
        return (
            <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 rounded-3xl border-4 border-slate-100 border-t-primary animate-spin" />
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Evaluating Obligations...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#FBFDFF] animate-fade-in relative">
            <TopBar title="Debts & Obligations" />

            <div className="p-10 space-y-10 overflow-y-auto pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <KpiCard title="Total Receivable" value={summary.receivablePrincipal} subValue="Principal lent" tint="emerald" />
                    <KpiCard title="Outstanding Credit" value={summary.receivableOutstanding} subValue="Pending recovery" tint="emerald" />
                    <KpiCard title="Total Payable" value={summary.payablePrincipal} subValue="Principal borrowed" tint="rose" />
                    <KpiCard title="Outstanding Debt" value={summary.payableOutstanding} subValue="Pending payment" tint="rose" />
                </div>

                <div className="flex items-center justify-between mb-2">
                    <div className="relative w-full xl:w-[450px] group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-all duration-300" size={18} />
                        <input type="text" placeholder="Search obligations..." className="w-full h-14 pl-14 pr-6 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:border-primary shadow-sm" />
                    </div>
                    <Button
                        onClick={() => setModal({ open: true, mode: 'create', data: null })}
                        className="h-14 px-8 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 gap-3 shadow-xl shadow-slate-900/10"
                    >
                        <HandCoins size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">New Obligation</span>
                    </Button>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50/30">
                                <th className="pl-10 pr-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Counterparty Entity</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Nature</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 text-right">Principal</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 text-right">Outstanding</th>
                                <th className="pl-6 pr-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {debts.map((d) => (
                                <tr key={d.id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="pl-10 pr-6 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                                <UserCircle size={24} />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 group-hover:text-primary list-none text-lg uppercase tracking-tight">{d.person?.name || 'External Entity'}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <ShieldCheck size={10} className="text-slate-300" />
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Verified Contract</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <Badge variant="default" className={cn("px-4 py-2 rounded-xl font-black border-none", d.kind === 'PAYABLE' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500')}>
                                            {d.kind}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-8 text-right font-black text-slate-400 text-sm tracking-tight">{d.principalAmount.toLocaleString()}</td>
                                    <td className="px-6 py-8 text-right">
                                        <div className={cn("font-black text-2xl tracking-tighter", d.kind === 'PAYABLE' ? 'text-rose-600' : 'text-emerald-600')}>
                                            <span className="text-[10px] mr-1 opacity-40">PKR</span>{d.outstandingAmount.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="pl-6 pr-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                                <Edit3 size={18} />
                                            </button>
                                            <button onClick={() => deleteMutation.mutate(d.id)} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            </div>

            <AnimatePresence>
                {modal.open && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-3xl">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Obligation Protocol</h2>
                            <div className="space-y-6 py-10 text-center">
                                <Users className="mx-auto text-slate-200" size={64} />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Entity creation requires person-module integration</p>
                                <Button onClick={() => setModal({ open: false, mode: 'create', data: null })} className="bg-slate-900 text-white w-full h-14 rounded-2xl">Close Protocol</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
