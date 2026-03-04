"use client";

import { useEffect, useState } from 'react';
import {
    HandCoins,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus,
    Coins
} from "lucide-react";

function LoanCard({ loan, onPayment }) {
    const progress = ((loan.amount - loan.remaining) / loan.amount) * 100;

    return (
        <div className="card-finance p-6 space-y-4">
            <div className="flex justify-between items-start">
                <div className={`p-2 rounded-xl ${loan.direction === 'given' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    <HandCoins size={20} />
                </div>
                <div className={`badge ${loan.status === 'settled' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                    {loan.status}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-white">{loan.person_name}</h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">{loan.direction === 'given' ? 'You Lent' : 'You Borrowed'}</p>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium">Progress</span>
                    <span className="text-white font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-bg-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ${loan.direction === 'given' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex justify-between items-end pt-2">
                <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Remaining</p>
                    <p className="text-xl font-black text-white">Rs. {loan.remaining.toLocaleString()}</p>
                </div>
                <button
                    disabled={loan.status === 'settled'}
                    onClick={() => onPayment(loan)}
                    className="p-2 rounded-xl bg-bg-800 text-gray-400 hover:text-white hover:bg-bg-700 transition-all disabled:opacity-20"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
    );
}

export default function DebtDashboard() {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchLoans() {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/loans`);
            setLoans(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchLoans();
    }, []);

    const totalGiven = loans.filter(l => l.direction === 'given').reduce((acc, curr) => acc + curr.remaining, 0);
    const totalTaken = loans.filter(l => l.direction === 'taken').reduce((acc, curr) => acc + curr.remaining, 0);

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
                    <h1 className="text-3xl font-extrabold tracking-tight">Debt Management</h1>
                    <p className="text-gray-400 mt-1 font-medium italic">Keep track of money you owe or are owed.</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Coins size={18} />
                    <span>New Loan</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-finance p-8 bg-emerald-500/5 border-emerald-500/10">
                    <p className="text-xs font-bold text-emerald-500/60 uppercase tracking-[0.2em]">Total Receivable</p>
                    <h2 className="text-4xl font-black text-emerald-500 mt-2">Rs. {totalGiven.toLocaleString()}</h2>
                    <div className="mt-4 flex items-center gap-2 text-emerald-500/40 text-xs font-bold uppercase">
                        <ArrowUpRight size={14} />
                        Money you lent to others
                    </div>
                </div>
                <div className="card-finance p-8 bg-rose-500/5 border-rose-500/10">
                    <p className="text-xs font-bold text-rose-500/60 uppercase tracking-[0.2em]">Total Payable</p>
                    <h2 className="text-4xl font-black text-rose-500 mt-2">Rs. {totalTaken.toLocaleString()}</h2>
                    <div className="mt-4 flex items-center gap-2 text-rose-500/40 text-xs font-bold uppercase">
                        <ArrowDownLeft size={14} />
                        Money you borrowed
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {loans.map(loan => (
                    <LoanCard key={loan.id} loan={loan} onPayment={() => alert("Payment modal coming soon!")} />
                ))}
                {loans.length === 0 && (
                    <div className="col-span-full py-20 bg-bg-900/40 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center">
                        <Plus size={48} className="text-gray-700 mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-sm">No active loans</p>
                    </div>
                )}
            </div>
        </div>
    );
}
