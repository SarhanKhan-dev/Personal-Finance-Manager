"use client";

import { useState } from "react";
import { X, Plus, Trash2, Zap, LayoutGrid, Receipt, Landmark, Wallet, CreditCard, Coins, Loader2, ChevronDown } from "lucide-react";
import { Button, Input, Label, SelectCard, Badge } from "./ui";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAssets, fetchSources, createTransaction } from "@/lib/api";

export default function TransactionModal({ isOpen, onClose, onSuccess }) {
    const queryClient = useQueryClient();

    // Remote Data
    const { data: assets = [] } = useQuery({ queryKey: ['assets'], queryFn: fetchAssets });
    const { data: sources = [] } = useQuery({ queryKey: ['sources'], queryFn: fetchSources });

    // Form State
    const [type, setType] = useState("EXPENSE");
    const [amount, setAmount] = useState("");
    const [assetId, setAssetId] = useState("");
    const [description, setDescription] = useState("");
    const [splits, setSplits] = useState([{ sourceId: "", amount: "" }]);
    const [occurredAt, setOccurredAt] = useState(new Date().toISOString().split('T')[0]);

    // Mutation
    const mutation = useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summary'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['sources'] });
            if (onSuccess) onSuccess();
            resetForm();
            onClose();
        }
    });

    const resetForm = () => {
        setType("EXPENSE");
        setAmount("");
        setAssetId("");
        setDescription("");
        setSplits([{ sourceId: "", amount: "" }]);
        setOccurredAt(new Date().toISOString().split('T')[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            type,
            totalAmount: parseFloat(amount),
            assetId,
            description: description || "Manual Transaction",
            occurredAt: new Date(occurredAt).toISOString(),
            splits: splits.map(s => ({
                sourceId: s.sourceId,
                amount: parseFloat(s.amount) || 0
            })),
            // Mock category/merchant if needed by API
            categoryId: null,
            merchantId: null
        };

        mutation.mutate(payload);
    };

    const addSplit = () => setSplits([...splits, { sourceId: "", amount: "" }]);
    const updateSplit = (index, field, value) => {
        const newSplits = [...splits];
        newSplits[index][field] = value;
        setSplits(newSplits);
    };
    const removeSplit = (index) => setSplits(splits.filter((_, i) => i !== index));

    const getAssetIcon = (type) => {
        switch (type) {
            case 'BANK': return Landmark;
            case 'CARD': return CreditCard;
            case 'CASH': return Coins;
            default: return Wallet;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.form
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onSubmit={handleSubmit}
                        className="relative bg-white border border-slate-100 rounded-[2rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-premium overflow-hidden antialiased"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-8 border-b border-slate-50 bg-[#fcfdfe]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                                    <Receipt size={24} />
                                </div>
                                <div className="space-y-0.5">
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-none">New Entry</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Movement Log</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-all group"
                            >
                                <X size={20} className="text-slate-400 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 overflow-y-auto flex-1 space-y-10 custom-scrollbar">

                            {/* Type Selection */}
                            <div className="space-y-4">
                                <Label className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Movement Nature</Label>
                                <div className="flex gap-3">
                                    {[
                                        { id: 'EXPENSE', label: 'Outflow', color: 'blue' },
                                        { id: 'INCOME', label: 'Inflow', color: 'emerald' },
                                        { id: 'TRANSFER_ASSET', label: 'Internal', color: 'slate' }
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setType(t.id)}
                                            className={cn(
                                                "flex-1 px-4 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border",
                                                type === t.id
                                                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                                            )}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Valuation Volume</Label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs uppercase group-focus-within:text-blue-600 transition-colors">PKR</span>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            required
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            className="text-3xl font-black h-16 pl-14 bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Timestamp</Label>
                                    <Input
                                        type="date"
                                        value={occurredAt}
                                        onChange={e => setOccurredAt(e.target.value)}
                                        className="h-16 bg-slate-50 border-none font-black text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Description / Purpose</Label>
                                <Input
                                    type="text"
                                    placeholder="Enter details..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="h-14 bg-slate-50 border-none font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Account Selector */}
                            <div className="space-y-4">
                                <Label className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Target Instrument</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {assets.map(a => (
                                        <div
                                            key={a.id}
                                            onClick={() => setAssetId(a.id)}
                                            className={cn(
                                                "p-4 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-2 group",
                                                assetId === a.id
                                                    ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm shadow-blue-500/5 scale-[1.02]"
                                                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                                assetId === a.id ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-white"
                                            )}>
                                                {(() => {
                                                    const Icon = getAssetIcon(a.type);
                                                    return <Icon size={20} />;
                                                })()}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest truncate w-full text-center">{a.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Funding Channels (Splits) */}
                            <div className="p-8 rounded-[2rem] bg-indigo-50/30 border border-indigo-100/50 space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                            <LayoutGrid size={16} />
                                        </div>
                                        <h3 className="text-xs font-black text-slate-700 tracking-[0.2em] uppercase">Channel Distribution</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addSplit}
                                        className="px-4 py-2 rounded-lg bg-white shadow-sm text-[9px] font-black text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest border border-indigo-100"
                                    >
                                        Add Channel
                                    </button>
                                </div>

                                {splits.map((split, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={i}
                                        className="flex gap-3 items-center"
                                    >
                                        <div className="flex-1 relative">
                                            <select
                                                className="w-full h-12 rounded-xl border border-slate-100 bg-white px-4 text-[11px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 appearance-none transition-all cursor-pointer"
                                                value={split.sourceId}
                                                required
                                                onChange={e => updateSplit(i, 'sourceId', e.target.value)}
                                            >
                                                <option value="">Select Channel...</option>
                                                {sources.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                                <ChevronDown size={14} />
                                            </div>
                                        </div>
                                        <div className="relative w-36">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">Val</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                required
                                                placeholder="0.00"
                                                className="h-12 text-right font-black pl-8 bg-white border-slate-100 focus:ring-indigo-100"
                                                value={split.amount}
                                                onChange={e => updateSplit(i, 'amount', e.target.value)}
                                            />
                                        </div>
                                        {splits.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSplit(i)}
                                                className="w-12 h-12 rounded-xl bg-white border border-rose-100 text-rose-500 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                                {splits.length === 0 && (
                                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase py-4">No channels linked to this entry</p>
                                )}
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-slate-50 bg-[#fcfdfe] flex items-center justify-between gap-6">
                            <div className="hidden sm:block">
                                <Badge variant="accent" className="bg-blue-50 text-blue-600 border-none font-black text-[9px] tracking-widest py-1.5">Auto-Balanced System</Badge>
                            </div>
                            <div className="flex gap-4 w-full sm:w-auto">
                                <Button
                                    variant="ghost"
                                    type="button"
                                    className="flex-1 sm:flex-none h-14 px-8 rounded-xl font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-colors"
                                    onClick={onClose}
                                >
                                    Discard
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="flex-1 sm:flex-none h-14 px-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 border-none min-w-[200px]"
                                >
                                    {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Proceed & Archive'}
                                </Button>
                            </div>
                        </div>
                    </motion.form>
                </div>
            )}
        </AnimatePresence>
    );
}



