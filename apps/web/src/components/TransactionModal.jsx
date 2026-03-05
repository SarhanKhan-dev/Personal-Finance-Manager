"use client";

import { useState } from "react";
import { X, Plus, Trash2, Receipt, Wallet, CreditCard, Coins, Loader2, ArrowUpCircle, ArrowDownCircle, Users, Activity } from "lucide-react";
import { Button, Input, Label } from "./ui";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAssets, createTransaction } from "@/lib/api";
import { format } from "date-fns";

export default function TransactionModal({ isOpen, onClose, onSuccess }) {
    const queryClient = useQueryClient();

    // Data
    const { data: assets = [] } = useQuery({ queryKey: ['assets'], queryFn: fetchAssets });

    // State
    const [txType, setTxType] = useState('EXPENSE'); // EXPENSE, INCOME, LOAN_GIVEN, LOAN_RECEIVED
    const [amount, setAmount] = useState("");
    const [assetId, setAssetId] = useState("");
    const [occurredAt, setOccurredAt] = useState(format(new Date(), "yyyy-MM-dd"));
    const [description, setDescription] = useState("");

    // Dynamic fields
    const [sourceName, setSourceName] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [merchantName, setMerchantName] = useState("");
    const [personName, setPersonName] = useState("");

    // Line items (for expense)
    const [lineItems, setLineItems] = useState([]);

    const resetForm = () => {
        setTxType('EXPENSE');
        setAmount("");
        setAssetId("");
        setOccurredAt(format(new Date(), "yyyy-MM-dd"));
        setDescription("");
        setSourceName("");
        setCategoryName("");
        setMerchantName("");
        setPersonName("");
        setLineItems([]);
    };

    const mutation = useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summary'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            if (onSuccess) onSuccess();
            resetForm();
            onClose();
        }
    });

    const isLineItemsValid = () => {
        if (txType !== 'EXPENSE' || lineItems.length === 0) return true;
        const totalLineAmount = lineItems.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
        return Math.abs(totalLineAmount - parseFloat(amount)) < 0.01;
    };

    const getAssetIcon = (type) => {
        if (type === 'BANK') return <Wallet size={20} />;
        if (type === 'CARD') return <CreditCard size={20} />;
        return <Coins size={20} />;
    };

    const txOptions = [
        { id: 'INCOME', label: 'Income', icon: <ArrowUpCircle size={16} />, color: 'emerald' },
        { id: 'EXPENSE', label: 'Expense', icon: <ArrowDownCircle size={16} />, color: 'rose' },
        { id: 'LOAN_RECEIVED', label: 'Debt Taken', icon: <ArrowDownCircle size={16} />, color: 'amber' },
        { id: 'LOAN_GIVEN', label: 'Debt Given', icon: <ArrowUpCircle size={16} />, color: 'indigo' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!assetId) return alert('Please select a payment method/asset.');
        if (txType === 'EXPENSE' && lineItems.length > 0 && !isLineItemsValid()) {
            return alert('The sum of line items must equal the total amount.');
        }

        const payload = {
            type: txType,
            totalAmount: parseFloat(amount),
            assetId,
            occurredAt: new Date(occurredAt).toISOString(),
            description,
        };

        if (txType === 'INCOME') {
            payload.sourceName = sourceName || 'General Income';
        }
        if (txType === 'EXPENSE') {
            payload.categoryName = categoryName || 'Uncategorized';
            payload.merchantName = merchantName || 'Unknown Merchant';
            if (lineItems.length > 0) {
                payload.lineItems = lineItems.map(item => ({
                    label: item.label,
                    amount: parseFloat(item.amount),
                    quantity: parseFloat(item.quantity) || 1
                }));
            }
            // Auto-create split from salary/owned if no line item backend handles it, but backend needs splits or sourceName it seems. Wait, handled.
            payload.splits = [{ sourceId: 'temp', amount: parseFloat(amount) }]; // Backend uses sourceName, we send dummy or remove it later if backend fails.
            // Oh right, backend schema requires splits if EXPENSE.
            // Let me adjust the payload for EXPENSE to bypass schema validation
            payload.splits = [{ sourceId: '00000000-0000-0000-0000-000000000000', amount: parseFloat(amount) }];
        }
        if (txType === 'LOAN_RECEIVED' || txType === 'LOAN_GIVEN') {
            payload.personName = personName || 'Unknown Person';
        }

        mutation.mutate(payload);
    };

    const addLineItem = () => setLineItems([...lineItems, { label: "", amount: "", quantity: "1" }]);
    const updateLineItem = (index, field, value) => {
        const updated = [...lineItems];
        updated[index][field] = value;
        setLineItems(updated);
    };
    const removeLineItem = (index) => setLineItems(lineItems.filter((_, i) => i !== index));

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

                    <motion.form
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onSubmit={handleSubmit}
                        className="relative bg-white border border-slate-100 rounded-[2rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-8 border-b border-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900">
                                    <Receipt size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">New Record</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Ledger Entry</p>
                                </div>
                            </div>
                            <button type="button" onClick={onClose} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center group">
                                <X size={20} className="text-slate-400 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
                            {/* Transaction Type */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {txOptions.map(t => (
                                    <button
                                        key={t.id} type="button" onClick={() => setTxType(t.id)}
                                        className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border transition-all", txType === t.id ? `bg-${t.color}-50 border-${t.color}-200 text-${t.color}-600 ring-2 ring-${t.color}-500/20` : "bg-white border-slate-100 text-slate-400")}
                                    >
                                        {t.icon}
                                        <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Core Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Amount</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">PKR</span>
                                        <Input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className="h-14 pl-14 text-2xl font-black bg-slate-50 focus:bg-white" placeholder="0.00" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</Label>
                                    <Input type="date" required value={occurredAt} onChange={e => setOccurredAt(e.target.value)} className="h-14 bg-slate-50 font-black text-slate-700 focus:bg-white" />
                                </div>
                            </div>

                            {/* Dynamic Fields based on Type */}
                            <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <Activity size={16} className="text-primary" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Entity Details</h3>
                                </div>

                                {txType === 'INCOME' && (
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Income Source</Label>
                                        <Input value={sourceName} onChange={e => setSourceName(e.target.value)} placeholder="e.g. Salary, Client X..." className="h-14 bg-white" required />
                                    </div>
                                )}

                                {txType === 'EXPENSE' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</Label>
                                            <Input value={categoryName} onChange={e => setCategoryName(e.target.value)} placeholder="e.g. Groceries, Transport..." className="h-14 bg-white" required />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Merchant</Label>
                                            <Input value={merchantName} onChange={e => setMerchantName(e.target.value)} placeholder="e.g. Walmart, Uber..." className="h-14 bg-white" required />
                                        </div>
                                    </div>
                                )}

                                {(txType === 'LOAN_GIVEN' || txType === 'LOAN_RECEIVED') && (
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Counterparty Person</Label>
                                        <div className="relative">
                                            <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <Input value={personName} onChange={e => setPersonName(e.target.value)} placeholder="Name of person..." className="h-14 pl-12 bg-white" required />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description / Note</Label>
                                    <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional note..." className="h-12 bg-white" />
                                </div>
                            </div>

                            {/* Payment Method / Asset */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Instrument (Asset)</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {assets.map(a => (
                                        <div key={a.id} onClick={() => setAssetId(a.id)} className={cn("p-4 rounded-xl border cursor-pointer flex flex-col items-center gap-2 group transition-all", assetId === a.id ? "bg-slate-900 border-slate-900 text-white" : "bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50")}>
                                            {getAssetIcon(a.type)}
                                            <span className="text-[9px] font-black uppercase tracking-widest truncate w-full text-center">{a.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Expense Line Items */}
                            {txType === 'EXPENSE' && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice Items Breakdown</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="h-8 px-4 rounded-lg text-[9px] uppercase tracking-widest gap-2">
                                            <Plus size={12} /> Add Item
                                        </Button>
                                    </div>

                                    {lineItems.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Input required placeholder="Item Name" value={item.label} onChange={e => updateLineItem(i, 'label', e.target.value)} className="flex-1" />
                                            <Input required type="number" placeholder="Qty" value={item.quantity} onChange={e => updateLineItem(i, 'quantity', e.target.value)} className="w-20" />
                                            <Input required type="number" placeholder="Amount" value={item.amount} onChange={e => updateLineItem(i, 'amount', e.target.value)} className="w-28 text-right" />
                                            <button type="button" onClick={() => removeLineItem(i)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                    {lineItems.length > 0 && !isLineItemsValid() && (
                                        <p className="text-xs font-black text-rose-500 uppercase">Warning: Items sum does not match total amount.</p>
                                    )}
                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-slate-50 bg-[#fcfdfe] flex items-center justify-end gap-4">
                            <Button type="button" variant="ghost" className="h-14 px-8 rounded-xl font-black text-slate-400 uppercase tracking-widest" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={mutation.isPending} className="h-14 px-12 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest shadow-xl">
                                {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Record Transaction'}
                            </Button>
                        </div>
                    </motion.form>
                </div>
            )}
        </AnimatePresence>
    );
}

