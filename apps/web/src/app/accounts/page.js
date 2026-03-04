"use client";

import { useEffect, useState } from 'react';
import {
    Wallet,
    Trash2,
    Plus,
    RefreshCw,
    MoreVertical,
    Pencil,
    AlertCircle
} from "lucide-react";

export default function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recalculating, setRecalculating] = useState(false);

    async function fetchAccounts() {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/accounts`);
            const data = await res.json();
            setAccounts(data);
        } catch (err) {
            console.error("Failed to fetch accounts:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAccounts();
    }, []);

    async function handleRecalc() {
        try {
            setRecalculating(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/accounts/recalc`, { method: 'POST' });
            const data = await res.json();
            setAccounts(data);
        } catch (err) {
            console.error("Recalculation failed:", err);
        } finally {
            setRecalculating(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Are you sure? Deleting an account will NOT delete its transactions, but it will disconnect them.")) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            await fetch(`${apiUrl}/accounts/${id}`, { method: 'DELETE' });
            fetchAccounts();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Your Accounts</h1>
                    <p className="text-gray-400 mt-1 font-medium italic">Manage all your wallets and bank accounts.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleRecalc}
                        disabled={recalculating}
                        className="btn-ghost flex items-center gap-2"
                    >
                        <RefreshCw size={18} className={recalculating ? "animate-spin" : ""} />
                        {recalculating ? "Recalculating..." : "Sync Balances"}
                    </button>
                    <button className="btn-primary flex items-center gap-2">
                        <Plus size={18} />
                        <span>Add Account</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((acc) => (
                    <div key={acc.id} className="card-finance p-8 h-56 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg" style={{ backgroundColor: `${acc.color}20`, color: acc.color, border: `1px solid ${acc.color}40` }}>
                                {acc.name[0]}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 bg-bg-800 rounded-lg hover:bg-bg-700 text-gray-400 hover:text-white transition-colors">
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(acc.id)}
                                    className="p-2 bg-rose-500/10 rounded-lg hover:bg-rose-500 text-rose-500 hover:text-white transition-all shadow-sm shadow-rose-500/10"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{acc.type}</p>
                            <h3 className="text-xl font-extrabold mt-1 tracking-tight text-white">{acc.name}</h3>
                        </div>

                        <div className="flex justify-between items-end pt-4 border-t border-white/5">
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Current Balance</p>
                                <p className="text-2xl font-black tracking-tighter" style={{ color: acc.color }}>Rs. {acc.balance.toLocaleString()}</p>
                            </div>
                            <div className="p-2 rounded-xl bg-bg-800/50">
                                <Wallet size={16} className="text-gray-500" />
                            </div>
                        </div>

                        {/* Background Glow */}
                        <div className={`absolute -bottom-16 -right-16 w-32 h-32 blur-3xl rounded-full`} style={{ backgroundColor: `${acc.color}15` }}></div>
                    </div>
                ))}
                {accounts.length === 0 && (
                    <div className="col-span-full py-20 bg-bg-900/40 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center">
                        <AlertCircle size={48} className="text-gray-700 mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-sm">No accounts found</p>
                        <button className="btn-primary mt-6">Create your first account</button>
                    </div>
                )}
            </div>
        </div>
    );
}
