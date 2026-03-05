"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPeople, fetchDebtsSummary, createPerson, updatePerson, deletePerson } from "@/lib/api";
import {
    Users, Search, Plus, Phone, ArrowUpRight, ArrowDownLeft,
    ChevronRight, Loader2, UserPlus, MoreHorizontal, ShieldCheck,
    Activity, History, Settings2, Trash2, Edit3, X, Info
} from "lucide-react";
import { Button, Input, Label, Badge } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { useDateRange } from "@/hooks/useDateRange";
import { cn } from "@/lib/utils";

export default function PeoplePage() {
    const queryClient = useQueryClient();
    const { from, to, setFrom, setTo, updateRange, isUpdating: isUpdatingRange } = useDateRange();
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
    const [formData, setFormData] = useState({ name: "", phone: "" });

    const { data: people = [], isLoading: isPeopleLoading } = useQuery({
        queryKey: ['people', search],
        queryFn: () => fetchPeople(search),
    });

    const { data: summary } = useQuery({
        queryKey: ['debts-summary'],
        queryFn: fetchDebtsSummary,
    });

    const mutation = useMutation({
        mutationFn: (data) => modal.mode === 'create' ? createPerson(data) : updatePerson(modal.data.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['people']);
            setModal({ open: false, mode: 'create', data: null });
            setFormData({ name: "", phone: "" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deletePerson,
        onSuccess: () => queryClient.invalidateQueries(['people'])
    });

    const handleOpenEdit = (person) => {
        setFormData({ name: person.name, phone: person.phone || "" });
        setModal({ open: true, mode: 'edit', data: person });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (isPeopleLoading && !people.length) {
        return (
            <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 rounded-[1.5rem] border-4 border-slate-100 border-t-slate-950 animate-spin" />
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Loading People...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#FBFDFF] animate-fade-in relative">
            <TopBar
                title="People"
                fromDate={from}
                toDate={to}
                onFromChange={setFrom}
                onToChange={setTo}
                onUpdate={updateRange}
                isUpdating={isUpdatingRange}
            />

            <div className="p-6 lg:p-8 space-y-8 pb-32">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 px-1">Contact List</h3>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Manage People</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => { setFormData({ name: "", phone: "" }); setModal({ open: true, mode: 'create', data: null }); }}
                            className="h-12 px-8 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-950/20 hover:translate-y-[-2px] active:scale-95 transition-all border-none text-xs"
                        >
                            <UserPlus size={16} className="mr-2" /> Add Person
                        </Button>
                    </div>
                </div>

                {/* Exposure Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100/50 relative overflow-hidden group shadow-xl shadow-emerald-500/5"
                    >
                        <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-1000" />
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Owed to you</p>
                                <h3 className="text-3xl font-black text-emerald-950 tracking-tighter">
                                    <span className="text-xs mr-2 opacity-30">PKR</span>
                                    {summary?.totalReceivableOutstanding?.toLocaleString() || "0"}
                                </h3>
                                <p className="text-emerald-500 font-bold text-[8px] uppercase tracking-widest mt-3 flex items-center gap-2">
                                    <ShieldCheck size={10} /> Positive Balance
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <ArrowUpRight size={22} />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="p-8 rounded-3xl bg-rose-50 border border-rose-100/50 relative overflow-hidden group shadow-xl shadow-rose-500/5"
                    >
                        <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-1000" />
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-[9px] font-black text-rose-600 uppercase tracking-[0.2em] mb-2">You owe to them</p>
                                <h3 className="text-3xl font-black text-rose-950 tracking-tighter">
                                    <span className="text-xs mr-2 opacity-30">PKR</span>
                                    {summary?.totalPayableOutstanding?.toLocaleString() || "0"}
                                </h3>
                                <p className="text-rose-400 font-bold text-[8px] uppercase tracking-widest mt-3 flex items-center gap-2">
                                    <Activity size={10} /> Settlement Pending
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
                                <ArrowDownLeft size={22} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Operations & Filter */}
                <div className="bg-white border border-slate-100 rounded-3xl shadow-3xl shadow-slate-200/40 overflow-hidden relative">
                    <div className="p-6 lg:p-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">Person Records</h2>
                            <p className="text-[9px] font-bold text-slate-300 uppercase mt-2 tracking-widest">Master List of All Contacts</p>
                        </div>

                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-slate-900 transition-all" size={16} />
                            <input
                                type="text" placeholder="Search by name..."
                                value={search} onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-12 pl-12 pr-6 bg-slate-50 border-none rounded-2xl text-[10px] font-black text-slate-700 placeholder:text-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-50/20 font-black text-[8px] text-slate-400 uppercase tracking-[0.3em]">
                                    <th className="px-8 py-5">Person</th>
                                    <th className="px-8 py-5">Phone Number</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {people.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="py-40 text-center">
                                            <Users className="mx-auto text-slate-50 mb-8 grayscale opacity-20" size={100} />
                                            <p className="text-slate-400 font-black text-xs uppercase tracking-[0.5em]">No people found</p>
                                        </td>
                                    </tr>
                                ) : people.map((p, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                        key={p.id} className="group hover:bg-slate-50/30 transition-all"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-50 to-white border border-slate-100 flex items-center justify-center text-slate-300 font-black text-lg group-hover:bg-slate-950 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-sm overflow-hidden relative">
                                                    <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <span className="relative z-10">{p.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 text-lg tracking-tight leading-none group-hover:text-primary transition-colors">{p.name}</div>
                                                    <div className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] mt-1.5">Active Contact</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2.5 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all">
                                                <Phone size={10} className="text-slate-300" />
                                                <span className="text-[10px] font-black text-slate-600 font-mono tracking-widest leading-none">{p.phone || "No Phone"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2.5 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                                <Link href={`/debts/person/${p.id}`}>
                                                    <button className="h-10 px-5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-950 hover:border-slate-300 hover:bg-slate-50 font-black text-[8px] uppercase tracking-widest transition-all shadow-sm flex items-center gap-2.5">
                                                        View Details <History size={12} />
                                                    </button>
                                                </Link>
                                                <button onClick={() => handleOpenEdit(p)} className="w-10 h-10 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-slate-950 hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center group/edit">
                                                    <Edit3 size={16} className="group-hover/edit:scale-110 transition-transform" />
                                                </button>
                                                <button onClick={() => { if (confirm("Delete person record?")) deleteMutation.mutate(p.id); }} className="w-10 h-10 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm flex items-center justify-center group/del">
                                                    <Trash2 size={16} className="group-hover/del:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Creation/Edit Modal */}
            <AnimatePresence>
                {modal.open && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal({ open: false, mode: 'create', data: null })} className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="relative bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-3xl p-10 overflow-hidden group/modal"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-5 grayscale group-hover:opacity-10 transition-all duration-1000 rotate-12 translate-x-4">
                                <Users size={160} className="text-slate-900" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-2xl shadow-slate-950/20">
                                        <UserPlus size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">{modal.mode === 'create' ? 'Add Person' : 'Update Info'}</h2>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 ml-0.5">Contact Detail Setup</p>
                                    </div>
                                </div>

                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Full Name</Label>
                                        <Input
                                            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required placeholder="e.g. John Doe" className="h-12 pl-6 text-base font-black bg-slate-50 border-none rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Phone Number</Label>
                                        <Input
                                            value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+92 3XX XXXXXXX" className="h-12 pl-6 text-base font-black bg-slate-50 border-none rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-900/5 transition-all outline-none font-mono"
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-all text-xs" onClick={() => setModal({ open: false, mode: 'create', data: null })}>Cancel</Button>
                                        <Button type="submit" disabled={mutation.isPending} className="flex-1 h-12 rounded-xl bg-slate-950 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-950/20 active:scale-95 transition-all text-xs">
                                            {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Save Contact'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="mt-auto px-10 py-6 border-t border-slate-50 bg-[#FBFDFF] text-center">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Contact Registry Node v2.1 - SYNCED & SECURE</p>
            </div>
        </div>
    );
}
