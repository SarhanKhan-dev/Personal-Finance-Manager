"use client";

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  Plus
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StatCard({ title, amount, icon: Icon, trend, colorClass }) {
  return (
    <div className="card-finance overflow-hidden h-32 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-xl bg-${colorClass}-500/10`}>
          <Icon size={20} className={`text-${colorClass}-500`} />
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/5 ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold mt-0.5">Rs. {amount.toLocaleString()}</h3>
      </div>
      {/* Background Glow */}
      <div className={`absolute -bottom-10 -right-10 w-24 h-24 bg-${colorClass}-500/10 blur-3xl rounded-full`}></div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    balance: 0,
    inflow: 0,
    outflow: 0,
    accounts: [],
    recentTransactions: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        // Fetch accounts
        const accountsRes = await fetch(`${apiUrl}/accounts`);
        const accounts = await accountsRes.json();

        // Fetch transactions
        const transactionsRes = await fetch(`${apiUrl}/transactions?limit=5`);
        const recentTransactions = await transactionsRes.json();

        // Calculate totals
        const balance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

        setStats({
          balance,
          inflow: 45000, // Mock for now until reports API is ready
          outflow: 12000,
          accounts,
          recentTransactions
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
          <h1 className="text-3xl font-extrabold tracking-tight">Main Dashboard</h1>
          <p className="text-gray-400 mt-1 font-medium italic">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="bg-bg-900/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-3">
          <Calendar size={18} className="text-accent-400" />
          <span className="text-sm font-bold text-gray-300">Today, 24 May 2024</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Balance" amount={stats.balance} icon={Wallet} colorClass="accent" />
        <StatCard title="Total Inflow" amount={stats.inflow} icon={TrendingUp} trend={12} colorClass="emerald" />
        <StatCard title="Total Outflow" amount={stats.outflow} icon={TrendingDown} trend={-5} colorClass="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Accounts List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
              <CreditCard size={16} className="text-accent-500" />
              Your Accounts
            </h2>
            <button className="text-[11px] font-bold text-accent-400 hover:text-accent-300 transition-colors uppercase tracking-widest">
              See All
            </button>
          </div>
          <div className="space-y-3">
            {stats.accounts.map((acc) => (
              <div key={acc.id} className="glass-sm p-4 rounded-2xl group hover:bg-bg-800/60 transition-all border border-transparent hover:border-white/5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg" style={{ backgroundColor: `${acc.color}20`, color: acc.color }}>
                      {acc.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-100">{acc.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{acc.type}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold tracking-tight">Rs. {acc.balance.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
              <Receipt size={16} className="text-accent-500" />
              Recent Transactions
            </h2>
          </div>
          <div className="glass overflow-hidden rounded-3xl border border-white/5">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Source / Label</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Account</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Date</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'inflow' ? 'bg-emerald-500/10 text-emerald-500' : tx.type === 'outflow' ? 'bg-rose-500/10 text-rose-500' : 'bg-accent-500/10 text-accent-500'}`}>
                          {tx.type === 'inflow' ? <ArrowUpRight size={14} /> : tx.type === 'outflow' ? <ArrowDownLeft size={14} /> : <TrendingUp size={14} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-100">{tx.source_label || tx.category || 'Untitled'}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{tx.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">
                        {tx.account_name}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-gray-500">
                      {tx.date}
                    </td>
                    <td className={`py-4 px-6 text-sm font-extrabold text-right ${tx.type === 'inflow' ? 'text-emerald-500' : tx.type === 'outflow' ? 'text-rose-500' : 'text-accent-400'}`}>
                      {tx.type === 'outflow' ? '-' : '+'} Rs. {tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {stats.recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-gray-500 font-medium italic">No transactions found. Add your first one!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
