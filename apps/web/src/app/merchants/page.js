"use client";

import {
    Store,
    Search,
    Plus,
    Loader2,
    MapPin,
    Trash2,
    Edit3,
    X,
    ChevronRight,
    ArrowUpRight
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMerchants, createMerchant, updateMerchant, deleteMerchant } from "@/lib/api";
import { TopBar } from "@/components/TopBar";
import { KpiCard } from "@/components/KpiCard";
import { useState } from "react";

export default function Merchants() {
    const queryClient = useQueryClient();
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
    const [name, setName] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['merchants'],
        queryFn: fetchMerchants
    });

    const createMutation = useMutation({
        mutationFn: createMerchant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchants'] });
            setModal({ open: false, mode: 'create', data: null });
            setName('');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateMerchant(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchants'] });
            setModal({ open: false, mode: 'create', data: null });
            setName('');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMerchant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchants'] });
        }
    });

    const merchants = data?.merchants || [];
    const summary = data?.summary || { totalCount: 0, totalVolume: 0, mostFrequent: 'N/A', highestValue: 'N/A' };

    const handleSave = () => {
        if (modal.mode === 'create') {
            createMutation.mutate({ name });
        } else {
            updateMutation.mutate({ id: modal.data.id, data: { name } });
        }
    };

    if (isLoading) {
        return (
            <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 rounded-3xl border-4 border-slate-100 border-t-primary animate-spin" />
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Identifying Entities...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#FBFDFF] animate-fade-in relative">
            <TopBar title="Merchants" />

            <div className="p-10 space-y-10 overflow-y-auto pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <KpiCard title="Total Merchants" value={summary.totalCount} subValue="Verified vendors" tint="blue" isCurrency={false} />
                    <KpiCard title="Total Volume" value={summary.totalVolume} subValue="Gross movement" tint="rose" />
                    <KpiCard title="Most Frequent" value={summary.mostFrequent} subValue="Preferred partner" tint="emerald" isCurrency={false} />
                    <KpiCard title="Highest Value" value={summary.highestValue} subValue="Core expense" tint="amber" isCurrency={false} />
                </div>

                <div className="flex items-center justify-between mb-2">
                    <div className="relative w-full xl:w-[450px] group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-all duration-300" size={18} />
                        <input type="text" placeholder="Search merchants..." className="w-full h-14 pl-14 pr-6 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 shadow-sm" />
                    </div>
                    <Button
                        onClick={() => { setName(''); setModal({ open: true, mode: 'create', data: null }); }}
                        className="h-14 px-8 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 gap-3 shadow-xl shadow-slate-900/10"
                    >
                        <Plus size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Add Merchant</span>
                    </Button>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50/30">
                                <th className="pl-10 pr-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Merchant Entity</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Industry</th>
                                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 text-right">Transactions</th>
                                <th className="pl-6 pr-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {merchants.map((m) => (
                                <tr key={m.id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="pl-10 pr-6 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                                <Store size={20} />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 group-hover:text-primary transition-colors text-lg uppercase tracking-tight">{m.name}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <MapPin size={10} className="text-slate-300" />
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Network</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Vendor</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8 text-right font-black text-slate-900 text-xl tracking-tighter">0</td>
                                    <td className="pl-6 pr-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => { setName(m.name); setModal({ open: true, mode: 'edit', data: m }); }} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                                <Edit3 size={18} />
                                            </button>
                                            <button onClick={() => deleteMutation.mutate(m.id)} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
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
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white w-full max-w-md rounded-[2rem] p-10 shadow-3xl">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">{modal.mode === 'create' ? 'Add Merchant' : 'Edit Merchant'}</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Merchant Name</label>
                                    <input value={name} onChange={e => setName(e.target.value)} type="text" className="w-full h-14 px-6 bg-white border border-slate-100 rounded-2xl font-bold focus:border-primary outline-none" placeholder="Enter entity name..." />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button onClick={() => setModal({ ...modal, open: false })} variant="ghost" className="flex-1 h-14 rounded-2xl font-black text-slate-400">CANCEL</Button>
                                    <Button onClick={handleSave} className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-black">{modal.mode === 'create' ? 'REGISTER' : 'UPDATE'}</Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
