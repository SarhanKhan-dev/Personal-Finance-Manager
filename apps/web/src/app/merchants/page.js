"use client";

import {
    Store, Search, Plus, Loader2, MapPin, Trash2, Edit3, X,
    ChevronRight, ArrowUpRight, Activity, Building2, ShieldCheck,
    CreditCard, ShoppingBag, Info
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMerchants, createMerchant, updateMerchant, deleteMerchant } from "@/lib/api";
import { TopBar } from "@/components/TopBar";
import { KpiCard } from "@/components/KpiCard";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function MerchantsPage() {
    const queryClient = useQueryClient();
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
    const [name, setName] = useState('');
    const [search, setSearch] = useState('');

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

    const filteredMerchants = (Array.isArray(merchants) ? merchants : []).filter(m =>
        m?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleSave = () => {
        if (!name.trim()) return;
        if (modal.mode === 'create') {
            createMutation.mutate({ name });
        } else {
            updateMutation.mutate({ id: modal.data.id, data: { name } });
        }
    };

    if (isLoading && !merchants.length) {
        return (
            <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-6 bg-[#FBFDFF]">
                <div className="w-16 h-16 rounded-[1.5rem] border-4 border-slate-100 border-t-emerald-950 animate-spin" />
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Loading merchants...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full bg-[#FBFDFF] animate-fade-in relative">
            <TopBar title="Merchants" />

            <div className="p-6 lg:p-8 space-y-8 pb-32">
                {/* Insights Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <KpiCard title="Total Merchants" primaryValue={summary.totalCount} primaryLabel="Active" secondaryValue="System" secondaryLabel="Synced" tint="blue" icon={<Store size={18} />} />
                    <KpiCard title="Total Volume" primaryValue={summary.totalVolume} primaryLabel="Net" secondaryValue="Volume" secondaryLabel="Historical" tint="rose" icon={<Activity size={18} />} />

                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/40 flex flex-col justify-between group overflow-hidden relative min-h-[140px]">
                        <div className="flex items-center justify-between relative z-10 mb-2">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Top Merchant</h4>
                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                                <Building2 size={16} />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-xl font-black text-slate-950 tracking-tighter truncate uppercase leading-none">{summary.highestValue || 'UNMAPPED'}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5 leading-none">Record setter</p>
                        </div>
                    </div>

                    <div className="bg-emerald-950 rounded-3xl p-6 text-white flex flex-col justify-between relative group overflow-hidden shadow-2xl shadow-emerald-900/40 min-h-[140px]">
                        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="flex items-center justify-between relative z-10 mb-2">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500">Most Frequent</h4>
                            <ShieldCheck size={16} className="text-emerald-700" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xl font-black text-white tracking-tighter truncate uppercase leading-none">{summary.mostFrequent || 'IDENTIFYING'}</p>
                            <p className="text-[8px] font-black text-emerald-700 uppercase tracking-widest mt-1.5 leading-none">Frequent visitation</p>
                        </div>
                    </div>
                </div>

                {/* Filters & Control Grid */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-slate-900 transition-all" size={16} />
                        <input
                            type="text" placeholder="Search merchants..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full h-12 pl-14 pr-6 bg-slate-50 border-none rounded-2xl text-[10px] font-black text-slate-700 placeholder:text-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                        />
                    </div>
                    <Button
                        onClick={() => { setName(''); setModal({ open: true, mode: 'create', data: null }); }}
                        className="h-12 px-8 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-950/20 gap-3 hover:translate-y-[-2px] active:scale-95 transition-all text-[10px]"
                    >
                        <Plus size={16} /> Add Merchant
                    </Button>
                </div>

                {/* Merchant Timeline/Table */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-100 shadow-3xl shadow-slate-200/40 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-50/20">
                                    <th className="pl-8 pr-6 py-5 text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Merchant Name</th>
                                    <th className="px-6 py-5 text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Type</th>
                                    <th className="px-6 py-5 text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Transactions</th>
                                    <th className="pl-6 pr-8 py-5 text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredMerchants.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-40 text-center">
                                            <div className="flex flex-col items-center justify-center grayscale opacity-10">
                                                <Store size={80} className="mb-6" />
                                                <p className="text-sm font-black uppercase tracking-[0.5em]">No merchants found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {filteredMerchants.map((m, idx) => (
                                    <motion.tr
                                        key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                                        className="group hover:bg-slate-50/50 transition-all font-inter"
                                    >
                                        <td className="pl-8 pr-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-950 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-sm">
                                                    <Store size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-950 text-base uppercase tracking-tighter group-hover:text-emerald-700 transition-colors leading-none">{m.name}</div>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <MapPin size={8} className="text-slate-300" />
                                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">Registry</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20 animate-pulse" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Merchant</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="font-black text-xl tracking-tighter text-slate-900">
                                                {m.stats?.txCount || 0} <span className="text-[9px] font-black text-slate-300 ml-1 uppercase">Logs</span>
                                            </div>
                                        </td>
                                        <td className="pl-6 pr-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2.5 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => { setName(m.name); setModal({ open: true, mode: 'edit', data: m }); }}
                                                    className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-950 hover:text-white transition-all shadow-sm active:scale-95 group/edit"
                                                >
                                                    <Edit3 size={16} className="group-hover/edit:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => { if (confirm("Delete this merchant?")) deleteMutation.mutate(m.id); }}
                                                    className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95 group/del"
                                                >
                                                    <Trash2 size={16} className="group-hover/del:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {modal.open && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 10 }} className="bg-white w-full max-w-md rounded-3xl p-10 shadow-3xl overflow-hidden relative group/modal">
                            <div className="absolute top-0 right-0 p-10 opacity-5 grayscale group-hover:opacity-20 transition-all duration-1000 -rotate-12 translate-x-4">
                                <Store size={140} className="text-slate-900" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">{modal.mode === 'create' ? 'Add Merchant' : 'Edit Merchant'}</h2>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 leading-none">Secure registry entry</p>
                                    </div>
                                </div>

                                <div className="space-y-6 mt-10 pb-4">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.4em] ml-2">Merchant Name</label>
                                        <input
                                            value={name} onChange={e => setName(e.target.value)} type="text"
                                            className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl font-black text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-900/5 transition-all outline-none text-base"
                                            placeholder="e.g. Amazon"
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button onClick={() => setModal({ ...modal, open: false })} variant="ghost" className="flex-1 h-14 rounded-2xl font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 text-xs">Cancel</Button>
                                        <Button
                                            onClick={handleSave}
                                            disabled={createMutation.isPending || updateMutation.isPending}
                                            className="flex-1 h-14 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest shadow-xl shadow-slate-950/20 hover:scale-105 active:scale-95 transition-all text-xs"
                                        >
                                            {(createMutation.isPending || updateMutation.isPending) ? <Loader2 size={18} className="animate-spin" /> : 'Save Entry'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-auto px-10 py-6 border-t border-slate-50 bg-[#fcfdfe]/50 text-center">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Merchant Management - Secure System</p>
            </div>
        </div>
    );
}
