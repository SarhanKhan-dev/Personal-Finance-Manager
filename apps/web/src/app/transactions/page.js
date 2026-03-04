"use client";

import { useEffect, useState } from 'react';
import {
    ArrowUpRight,
    ArrowDownLeft,
    ArrowRightLeft,
    Filter,
    Search,
    Trash2,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    TrendingDown
} from "lucide-react";

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        accountId: '',
        dateFrom: '',
        dateTo: ''
    });
    const [accounts, setAccounts] = useState([]);

    async function fetchInitialData() {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const accRes = await fetch(`${apiUrl}/accounts`);
            setAccounts(await accRes.json());
            fetchTransactions();
        } catch (err) {
            console.error(err);
        }
    }

    async function fetchTransactions() {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`${apiUrl}/transactions?${query}`);
            setTransactions(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const deleteTx = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            await fetch(`${apiUrl}/transactions/${id}`, { method: 'DELETE' });
            fetchTransactions();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Financial Ledger</h1>
                    <p className="text-gray-400 mt-1 font-medium italic">Comprehensive history of all your movements.</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="glass p-6 rounded-3xl grid grid-cols-1 md:grid-cols-5 gap-4 border border-white/5 shadow-soft">
                <div className="relative col-span-1 md:col-span-2">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text" name="search" placeholder="Search by note, category, person..."
                        value={filters.search} onChange={handleFilterChange}
                        className="input-finance pl-11"
                    />
                </div>
                <select name="type" value={filters.type} onChange={handleFilterChange} className="input-finance appearance-none">
                    <option value="">All Types</option>
                    <option value="inflow">Inflow</option>
                    <option value="outflow">Outflow</option>
                    <option value="transfer">Transfer</option>
                </select>
                <select name="accountId" value={filters.accountId} onChange={handleFilterChange} className="input-finance appearance-none">
                    <option value="">All Accounts</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
                <button onClick={fetchTransactions} className="btn-primary flex items-center justify-center gap-2">
                    <Filter size={18} />
                    <span>Apply Filters</span>
                </button>
            </div>

            {/* Transactions Table */}
            <div className="glass overflow-hidden rounded-3xl border border-white/5">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/[0.02]">
                            <th className="py-5 px-6 text-[11px] font-bold uppercase tracking-widest text-gray-500">Transaction Details</th>
                            <th className="py-5 px-6 text-[11px] font-bold uppercase tracking-widest text-gray-500">Accounts</th>
                            <th className="py-5 px-6 text-[11px] font-bold uppercase tracking-widest text-gray-500 text-center">Date</th>
                            <th className="py-5 px-6 text-[11px] font-bold uppercase tracking-widest text-gray-500 text-right">Amount</th>
                            <th className="py-5 px-6 text-[11px] font-bold uppercase tracking-widest text-gray-500 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors group">
                                <td className="py-5 px-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${tx.type === 'inflow' ? 'bg-emerald-500/10 text-emerald-500' : tx.type === 'outflow' ? 'bg-rose-500/10 text-rose-500' : 'bg-accent-500/10 text-accent-400'}`}>
                                            {tx.type === 'inflow' ? <ArrowUpRight size={18} /> : tx.type === 'outflow' ? <ArrowDownLeft size={18} /> : <ArrowRightLeft size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white tracking-tight">{tx.source_label || tx.category || 'Untitled'}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white/5 ${tx.type === 'inflow' ? 'text-emerald-500' : tx.type === 'outflow' ? 'text-rose-500' : 'text-accent-400'}`}>{tx.type}</span>
                                                {tx.person_name && <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">via {tx.person_name}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-5 px-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.account_color }}></div>
                                            <span className="text-xs font-bold text-gray-300">{tx.account_name}</span>
                                        </div>
                                        {tx.type === 'transfer' && tx.to_account_name && (
                                            <div className="flex items-center gap-2">
                                                <ArrowRightLeft size={10} className="text-gray-600" />
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.to_account_color }}></div>
                                                <span className="text-xs font-bold text-gray-300">{tx.to_account_name}</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="py-5 px-6 text-center">
                                    <p className="text-xs font-bold text-gray-400">{tx.date}</p>
                                </td>
                                <td className={`py-5 px-6 text-right font-black tracking-tighter ${tx.type === 'inflow' ? 'text-emerald-500' : tx.type === 'outflow' ? 'text-rose-500' : 'text-accent-400'}`}>
                                    Rs. {tx.amount.toLocaleString()}
                                </td>
                                <td className="py-5 px-6 text-center">
                                    <button
                                        onClick={() => deleteTx(tx.id)}
                                        className="p-2.5 rounded-xl bg-rose-500/5 text-gray-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && !loading && (
                            <tr>
                                <td colSpan="5" className="py-20 text-center text-gray-500 font-medium italic">No transactions match your filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
