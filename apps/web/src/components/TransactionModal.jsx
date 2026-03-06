"use client";

import { useState, useEffect } from "react";
import {
    X, Plus, Trash2, Receipt, Wallet, CreditCard, Coins,
    Loader2, ArrowUpCircle, ArrowDownCircle, Users, Activity,
    Repeat, ArrowRightLeft, UserCircle, ShieldCheck, Zap,
    CheckCircle2, Info, Building2, Store, Tags, Calendar
} from "lucide-react";
import { Button, Input, Label, Badge } from "./ui";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAssets, fetchOwners, fetchPeople, createTransaction, fetchCategories, fetchMerchants } from "@/lib/api";
import { format } from "date-fns";

export default function TransactionModal({ isOpen, onClose, onSuccess }) {
    const queryClient = useQueryClient();

    // Data Fetching
    const { data: assetsData } = useQuery({ queryKey: ['assets'], queryFn: fetchAssets, enabled: isOpen });
    const { data: ownersData } = useQuery({ queryKey: ['owners'], queryFn: fetchOwners, enabled: isOpen });
    const { data: peopleData } = useQuery({ queryKey: ['people'], queryFn: () => fetchPeople(), enabled: isOpen });
    const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories, enabled: isOpen });
    const { data: merchantsData } = useQuery({ queryKey: ['merchants'], queryFn: fetchMerchants, enabled: isOpen });

    const assets = Array.isArray(assetsData) ? assetsData : [];
    const owners = Array.isArray(ownersData) ? ownersData : [];
    const people = Array.isArray(peopleData) ? peopleData : (peopleData?.people || []);
    const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.categories || []);
    const merchants = Array.isArray(merchantsData) ? merchantsData : (merchantsData?.merchants || []);

    // Core State
    const [txType, setTxType] = useState('EXPENSE');
    const [amount, setAmount] = useState("");
    const [occurredAt, setOccurredAt] = useState(format(new Date(), "yyyy-MM-dd"));
    const [description, setDescription] = useState("");

    // Entity State
    const [assetId, setAssetId] = useState("");
    const [fromAssetId, setFromAssetId] = useState("");
    const [toAssetId, setToAssetId] = useState("");
    const [fromOwnerId, setFromOwnerId] = useState("");
    const [toOwnerId, setToOwnerId] = useState("");
    const [personId, setPersonId] = useState("");

    // Metadata State
    const [categoryName, setCategoryName] = useState("");
    const [merchantName, setMerchantName] = useState("");

    // Allocation State
    const [splits, setSplits] = useState([]);
    const [debtDirection, setDebtDirection] = useState('LEND'); // LEND, BORROW, PAY_BACK, RECEIVE_BACK

    useEffect(() => {
        if (!isOpen) return;
        if (assets.length > 0 && !assetId) setAssetId(assets[0].id);
        if (owners.length > 0 && splits.length === 0) {
            setSplits([{ sourceId: owners[0].id, amount: "" }]);
        }
    }, [isOpen, assets, owners]);

    const resetForm = () => {
        setTxType('EXPENSE');
        setAmount("");
        setAssetId(assets[0]?.id || "");
        setOccurredAt(format(new Date(), "yyyy-MM-dd"));
        setDescription("");
        setCategoryName("");
        setMerchantName("");
        setPersonId("");
        setSplits(owners.length > 0 ? [{ sourceId: owners[0].id, amount: "" }] : []);
    };

    const mutation = useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summary'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['owners'] });
            queryClient.invalidateQueries({ queryKey: ['debts'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            if (onSuccess) onSuccess();
            resetForm();
            onClose();
        },
        onError: (err) => alert(err.message)
    });

    const txOptions = [
        { id: 'EXPENSE', label: 'Expense', icon: <ArrowDownCircle size={16} />, color: 'rose' },
        { id: 'INCOME', label: 'Income', icon: <ArrowUpCircle size={16} />, color: 'emerald' },
        { id: 'TRANSFER', label: 'Transfer', icon: <ArrowRightLeft size={16} />, color: 'slate' },
        { id: 'DEBT', label: 'Debt', icon: <Users size={16} />, color: 'amber' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) return alert('Enter a valid amount');

        let payload = {
            type: txType,
            totalAmount: numAmount,
            occurredAt: new Date(occurredAt).toISOString(),
            description,
        };

        if (txType === 'TRANSFER') {
            if (fromAssetId && toAssetId) {
                payload.type = 'ASSET_TRANSFER';
                payload.fromAssetId = fromAssetId;
                payload.toAssetId = toAssetId;
            } else if (fromOwnerId && toOwnerId) {
                payload.type = 'OWNERSHIP_TRANSFER';
                payload.fromOwnerId = fromOwnerId;
                payload.toOwnerId = toOwnerId;
            } else {
                return alert('Identify source and destination protocols');
            }
        } else if (txType === 'DEBT') {
            if (!personId) return alert('Identify associate entity');
            payload.personId = personId;
            if (debtDirection === 'LEND') payload.type = 'LOAN_GIVEN';
            else if (debtDirection === 'BORROW') payload.type = 'LOAN_RECEIVED';
            else {
                payload.type = 'DEBT_PAYMENT';
                payload.direction = debtDirection === 'PAY_BACK' ? 'PAY' : 'RECEIVE';
            }
            payload.assetId = assetId;
            payload.splits = splits.map(s => ({ sourceId: s.sourceId, amount: parseFloat(s.amount) || numAmount }));
        } else {
            if (!assetId) return alert('Select instrument node');
            payload.assetId = assetId;
            payload.categoryName = categoryName || 'Unassigned';
            payload.merchantName = merchantName || 'Direct Protocol';
            if (personId) payload.personId = personId;
            payload.splits = splits.map(s => ({ sourceId: s.sourceId, amount: parseFloat(s.amount) || numAmount }));
        }

        mutation.mutate(payload);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 overflow-y-auto CustomScrollbar">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl" />

                    <motion.form
                        initial={{ opacity: 0, scale: 0.95, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 40 }}
                        onSubmit={handleSubmit}
                        className="relative bg-white border border-slate-100 rounded-[4rem] w-full max-w-2xl flex flex-col shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] overflow-hidden"
                    >
                        {/* Status Bar */}
                        <div className="bg-slate-950 py-2.5 px-8 flex items-center justify-between overflow-hidden relative">
                            <div className="flex items-center gap-3 relative z-10">
                                <ShieldCheck size={12} className="text-emerald-400" />
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Secure Transaction Ledger</span>
                            </div>
                            <div className="flex items-center gap-2 relative z-10">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none">Live Connection</span>
                            </div>
                        </div>

                        {/* Branding Header */}
                        <div className="flex items-center justify-between p-10 lg:p-12 border-b border-slate-50 bg-white">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-xl shadow-slate-950/20">
                                    <Plus size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-950 tracking-tighter uppercase leading-none">New Entry</h2>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 ml-0.5">Register a financial movement</p>
                                </div>
                            </div>
                            <button type="button" onClick={onClose} className="w-12 h-12 bg-slate-50 hover:bg-slate-950 hover:text-white rounded-xl flex items-center justify-center transition-all active:scale-90">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Transaction Body */}
                        <div className="p-10 lg:p-12 space-y-12 bg-white max-h-[60vh] overflow-y-auto CustomScrollbar">
                            {/* Type Selector */}
                            <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-1.5 border border-slate-200/50">
                                {Array.isArray(txOptions) && txOptions.map(t => (
                                    <button
                                        key={t.id} type="button" onClick={() => setTxType(t.id)}
                                        className={cn(
                                            "flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-xl transition-all duration-300 relative overflow-hidden",
                                            txType === t.id
                                                ? `bg-slate-950 text-white shadow-xl shadow-slate-950/20`
                                                : "text-slate-400 hover:text-slate-950 hover:bg-white/50"
                                        )}
                                    >
                                        <div className={cn("p-1.5 rounded transition-colors")}>
                                            {t.icon}
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest">{t.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Core Quantitative Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Amount</Label>
                                        <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[9px]">PKR</Badge>
                                    </div>
                                    <div className="relative group">
                                        <Input
                                            type="number" step="0.01" required
                                            value={amount} onChange={e => setAmount(e.target.value)}
                                            className="h-20 pl-6 text-4xl font-black bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-950/5 transition-all outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Date</Label>
                                        <Calendar size={12} className="text-slate-300" />
                                    </div>
                                    <Input
                                        type="date" required
                                        value={occurredAt} onChange={e => setOccurredAt(e.target.value)}
                                        className="h-20 bg-slate-50 border-none rounded-2xl font-black text-xl text-slate-700 focus:bg-white focus:ring-4 focus:ring-slate-950/5 px-6 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Entity & Metadata Logic */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={txType} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                    className="space-y-10"
                                >
                                    {/* DEBT SUB-PROTOCOL */}
                                    {txType === 'DEBT' && (
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                                            {['LEND', 'BORROW', 'PAY_BACK', 'RECEIVE_BACK'].map(d => (
                                                <button
                                                    key={d} type="button" onClick={() => setDebtDirection(d)}
                                                    className={cn(
                                                        "py-3 px-3 rounded-xl text-[8px] font-black uppercase tracking-tight transition-all",
                                                        debtDirection === d
                                                            ? "bg-amber-950 text-white shadow-xl shadow-amber-950/20"
                                                            : "text-amber-700 hover:bg-white"
                                                    )}
                                                >
                                                    {d.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* DYNAMIC FIELDSET */}
                                    <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 space-y-8 relative overflow-hidden group/form">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-900/10 to-transparent" />

                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-950 shadow-sm">
                                                <Activity size={16} />
                                            </div>
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-950">Movement Details</h3>
                                        </div>

                                        {/* Primary Identity Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {['INCOME', 'DEBT'].includes(txType) && (
                                                <div className="space-y-3">
                                                    <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-2">Person (From/To)</Label>
                                                    <select
                                                        value={personId} onChange={e => setPersonId(e.target.value)} required={txType === 'DEBT'}
                                                        className="w-full h-14 bg-white border-slate-100 rounded-xl px-6 font-black text-slate-700 focus:ring-4 focus:ring-slate-950/5 outline-none appearance-none cursor-pointer text-xs"
                                                    >
                                                        <option value="">{txType === 'INCOME' ? 'None / Anonymous' : 'Select Person'}</option>
                                                        {people.map(p => <option key={p.id} value={p.id}>{p?.name?.toUpperCase()}</option>)}
                                                    </select>
                                                </div>
                                            )}

                                            {['INCOME', 'EXPENSE', 'DEBT'].includes(txType) && (
                                                <div className="space-y-3">
                                                    <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-2">Account / Asset</Label>
                                                    <select
                                                        value={assetId} onChange={e => setAssetId(e.target.value)} required
                                                        className="w-full h-14 bg-white border-slate-100 rounded-xl px-6 font-black text-slate-700 focus:ring-4 focus:ring-slate-950/5 outline-none appearance-none cursor-pointer text-xs"
                                                    >
                                                        {assets.map(a => <option key={a.id} value={a.id}>{a?.name?.toUpperCase()} ({a.type})</option>)}
                                                    </select>
                                                </div>
                                            )}

                                            {txType === 'TRANSFER' && (
                                                <>
                                                    <div className="space-y-3">
                                                        <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-2">From</Label>
                                                        <select
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                if (val.startsWith('asset:')) { setFromAssetId(val.split(':')[1]); setFromOwnerId(""); }
                                                                else { setFromOwnerId(val.split(':')[1]); setFromAssetId(""); }
                                                            }}
                                                            className="w-full h-14 bg-white border-slate-100 rounded-xl px-6 font-black text-slate-700 outline-none appearance-none text-xs"
                                                        >
                                                            <option value="">Origin</option>
                                                            <optgroup label="Assets">
                                                                {assets.map(a => <option key={a.id} value={`asset:${a.id}`}>{a.name.toUpperCase()}</option>)}
                                                            </optgroup>
                                                            <optgroup label="Owners">
                                                                {owners.map(o => <option key={o.id} value={`owner:${o.id}`}>{o.name.toUpperCase()}</option>)}
                                                            </optgroup>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-2">To</Label>
                                                        <select
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                if (val.startsWith('asset:')) { setToAssetId(val.split(':')[1]); setToOwnerId(""); }
                                                                else { setToOwnerId(val.split(':')[1]); setToAssetId(""); }
                                                            }}
                                                            className="w-full h-14 bg-white border-slate-100 rounded-xl px-6 font-black text-slate-700 outline-none appearance-none text-xs"
                                                        >
                                                            <option value="">Destination</option>
                                                            <optgroup label="Assets">
                                                                {assets.map(a => <option key={a.id} value={`asset:${a.id}`}>{a?.name?.toUpperCase()}</option>)}
                                                            </optgroup>
                                                            <optgroup label="Owners">
                                                                {owners.map(o => <option key={o.id} value={`owner:${o.id}`}>{o?.name?.toUpperCase()}</option>)}
                                                            </optgroup>
                                                        </select>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Classification Metadata */}
                                        {['INCOME', 'EXPENSE'].includes(txType) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 ml-2">
                                                        <Tags size={12} className="text-slate-300" />
                                                        <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Category</Label>
                                                    </div>
                                                    <select
                                                        value={categoryName} onChange={e => setCategoryName(e.target.value)}
                                                        className="w-full h-14 bg-white border-slate-100 rounded-xl px-6 font-black text-slate-700 outline-none appearance-none text-xs"
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map(c => <option key={c.id} value={c.name}>{c?.name?.toUpperCase()}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 ml-2">
                                                        <Store size={12} className="text-slate-300" />
                                                        <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                                            {txType === 'INCOME' ? 'Payer / Source' : 'Merchant / Vendor'}
                                                        </Label>
                                                    </div>
                                                    <select
                                                        value={merchantName} onChange={e => setMerchantName(e.target.value)}
                                                        className="w-full h-14 bg-white border-slate-100 rounded-xl px-6 font-black text-slate-700 outline-none appearance-none text-xs"
                                                    >
                                                        <option value="">None / Direct</option>
                                                        {merchants.map(m => <option key={m.id} value={m.name}>{m?.name?.toUpperCase()}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {/* Ownership Attribution Splits */}
                                        {['INCOME', 'EXPENSE', 'DEBT'].includes(txType) && (
                                            <div className="space-y-6 pt-8 border-t border-slate-100/50">
                                                <div className="flex items-center justify-between px-2">
                                                    <div className="flex items-center gap-3">
                                                        <ShieldCheck size={14} className="text-emerald-500" />
                                                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-900">Ownership Attribution</Label>
                                                    </div>
                                                    <Button type="button" variant="outline" size="sm" onClick={() => setSplits([...splits, { sourceId: owners[0]?.id, amount: "" }])} className="h-8 px-4 rounded-xl text-[8px] uppercase font-black bg-white border-slate-200 hover:bg-slate-950 hover:text-white transition-all">
                                                        <Plus size={12} className="mr-2" /> ADD SPLIT
                                                    </Button>
                                                </div>
                                                <div className="space-y-4">
                                                    {splits.map((s, i) => (
                                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex gap-3 items-center">
                                                            <div className="flex-1 bg-white rounded-xl overflow-hidden border border-slate-100 flex items-center px-4 gap-3 h-14">
                                                                <UserCircle size={18} className="text-slate-300" />
                                                                <select
                                                                    value={s.sourceId} onChange={e => {
                                                                        const n = [...splits];
                                                                        n[i].sourceId = e.target.value;
                                                                        setSplits(n);
                                                                    }}
                                                                    className="flex-1 h-full bg-transparent font-black text-slate-700 outline-none appearance-none cursor-pointer uppercase text-[10px]"
                                                                >
                                                                    {owners.map(o => <option key={o.id} value={o.id}>{o?.name?.toUpperCase()}</option>)}
                                                                </select>
                                                            </div>
                                                            <div className="w-32 relative group/val">
                                                                <Input
                                                                    placeholder="AUTO"
                                                                    value={s.amount} onChange={e => {
                                                                        const n = [...splits];
                                                                        n[i].amount = e.target.value;
                                                                        setSplits(n);
                                                                    }}
                                                                    className="h-14 px-4 font-black bg-white border-slate-100 rounded-xl focus:ring-4 focus:ring-slate-950/5 transition-all outline-none text-xs"
                                                                />
                                                            </div>
                                                            {splits.length > 1 && (
                                                                <button type="button" onClick={() => setSplits(splits.filter((_, idx) => idx !== i))} className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-rose-300 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all active:scale-90">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 px-2">
                                                <Info size={12} className="text-slate-300" />
                                                <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Description</Label>
                                            </div>
                                            <Input
                                                value={description} onChange={e => setDescription(e.target.value)}
                                                placeholder="Add details..."
                                                className="h-14 pl-6 font-black bg-white border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-950/5 transition-all outline-none text-slate-600 text-xs"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Control Footer */}
                        <div className="p-8 lg:p-10 border-t border-slate-50 bg-[#FBFDFF] flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100/50">
                                    <CheckCircle2 size={20} />
                                </div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Double-entry verified</p>
                            </div>

                            <div className="flex gap-4 w-full md:w-auto">
                                <Button
                                    type="button" variant="ghost"
                                    className="flex-1 md:flex-none h-14 px-8 rounded-xl font-black text-slate-400 uppercase tracking-widest transition-all text-[10px]"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit" disabled={mutation.isPending}
                                    className="flex-1 md:flex-none h-14 px-12 rounded-xl bg-slate-950 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-950/20 active:scale-95 transition-all border-none text-[10px]"
                                >
                                    {mutation.isPending ? <Loader2 className="animate-spin" size={16} /> : 'Save Transaction'}
                                </Button>
                            </div>
                        </div>
                    </motion.form>
                </div>
            )}
        </AnimatePresence>
    );
}
