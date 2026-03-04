"use client";

import { useEffect, useState } from 'react';
import {
    X,
    ArrowUpRight,
    ArrowDownLeft,
    ArrowRightLeft,
    CircleDollarSign,
    HandHelping,
    UserPlus
} from "lucide-react";
import { format } from "date-fns";

export default function TransactionModal({ isOpen, onClose, onSuccess }) {
    const [type, setType] = useState('outflow');
    const [accounts, setAccounts] = useState([]);
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        account_id: '',
        to_account_id: '',
        category: 'General',
        source_label: '',
        person_id: '',
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            fetch(`${apiUrl}/accounts`).then(res => res.json()).then(setAccounts);
            fetch(`${apiUrl}/persons`).then(res => res.json()).then(setPersons);

            // Default to first account
            if (accounts.length > 0 && !formData.account_id) {
                setFormData(prev => ({ ...prev, account_id: accounts[0].id }));
            }
        }
    }, [isOpen]);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    type,
                    amount: parseFloat(formData.amount)
                })
            });
            if (res.ok) {
                onSuccess?.();
                onClose();
            }
        } catch (err) {
            console.error("Failed to create transaction:", err);
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-bg-950/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="glass w-full max-w-xl rounded-3xl overflow-hidden animate-slide-up border border-white/5 shadow-modal">
                <div className="p-6 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
                    <h2 className="text-xl font-bold tracking-tight">Add Transaction</h2>
                    <button onClick={onClose} className="p-2 hover:bg-bg-800 rounded-xl transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Type Selector */}
                    <div className="grid grid-cols-3 gap-3">
                        <button type="button" onClick={() => setType('inflow')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border-2 ${type === 'inflow' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-bg-800 border-transparent text-gray-400'}`}>
                            <ArrowUpRight size={20} />
                            <span className="text-[10px] font-extrabold uppercase tracking-widest">Inflow</span>
                        </button>
                        <button type="button" onClick={() => setType('outflow')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border-2 ${type === 'outflow' ? 'bg-rose-500/10 border-rose-500 text-rose-500 shadow-lg shadow-rose-500/10' : 'bg-bg-800 border-transparent text-gray-400'}`}>
                            <ArrowDownLeft size={20} />
                            <span className="text-[10px] font-extrabold uppercase tracking-widest">Outflow</span>
                        </button>
                        <button type="button" onClick={() => setType('transfer')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border-2 ${type === 'transfer' ? 'bg-accent-500/10 border-accent-500 text-accent-400 shadow-lg shadow-accent-500/10' : 'bg-bg-800 border-transparent text-gray-400'}`}>
                            <ArrowRightLeft size={20} />
                            <span className="text-[10px] font-extrabold uppercase tracking-widest">Transfer</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Amount (Rs.)</label>
                            <input
                                type="number" step="0.01" required
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                className="input-finance text-2xl font-black py-4 placeholder:text-gray-700"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{type === 'transfer' ? 'From Account' : 'Account'}</label>
                            <select
                                required
                                value={formData.account_id}
                                onChange={e => setFormData({ ...formData, account_id: e.target.value })}
                                className="input-finance appearance-none"
                            >
                                <option value="" disabled className="bg-bg-900">Select Account</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id} className="bg-bg-900">{acc.name} (Rs. {acc.balance})</option>
                                ))}
                            </select>
                        </div>

                        {type === 'transfer' ? (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">To Account</label>
                                <select
                                    required
                                    value={formData.to_account_id}
                                    onChange={e => setFormData({ ...formData, to_account_id: e.target.value })}
                                    className="input-finance appearance-none"
                                >
                                    <option value="" disabled className="bg-bg-900">Select To Account</option>
                                    {accounts.filter(a => a.id != formData.account_id).map(acc => (
                                        <option key={acc.id} value={acc.id} className="bg-bg-900">{acc.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Date</label>
                                <input
                                    type="date" required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="input-finance"
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Category / Source</label>
                            <input
                                type="text"
                                value={formData.source_label}
                                onChange={e => setFormData({ ...formData, source_label: e.target.value })}
                                className="input-finance"
                                placeholder="e.g. Salary, Grocery..."
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Notes (Optional)</label>
                            <input
                                type="text"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="input-finance"
                                placeholder="..."
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={loading} className="w-full btn-primary h-14 text-lg">
                            {loading ? "Recording..." : "Save Transaction"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
