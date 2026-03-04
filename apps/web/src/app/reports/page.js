"use client";

import { useEffect, useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    PieChart as PieIcon,
    Download,
    Calendar,
    Filter
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

export default function Reports() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSummary() {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const res = await fetch(`${apiUrl}/reports/summary`);
                setData(await res.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchSummary();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-full animate-pulse text-gray-500 font-bold uppercase tracking-widest">Generating Reports...</div>;

    const COLORS = ['#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#ec4899'];

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Financial Insights</h1>
                    <p className="text-gray-400 mt-1 font-medium italic">Deep dive into your spending and saving patterns.</p>
                </div>
                <button className="btn-ghost flex items-center gap-2">
                    <Download size={18} />
                    <span>Export CSV</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Spending by Category */}
                <div className="card-finance p-8 min-h-[400px]">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                            <PieIcon size={16} className="text-accent-500" />
                            Spending Breakdown
                        </h2>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.byCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="total"
                                    nameKey="category"
                                >
                                    {data.byCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0d0f1a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        {data.byCategory.slice(0, 4).map((cat, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">{cat.category}: Rs. {cat.total}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Daily Cash Flow */}
                <div className="card-finance p-8 min-h-[400px]">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-500" />
                            Daily Cash Flow
                        </h2>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.daily}>
                                <defs>
                                    <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0d0f1a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="inflow" stroke="#10b981" fillOpacity={1} fill="url(#colorInflow)" />
                                <Area type="monotone" dataKey="outflow" stroke="#f43f5e" fillOpacity={1} fill="url(#colorOutflow)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Account Performance */}
            <div className="card-finance p-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2 mb-8">
                    <BarChart3 size={16} className="text-accent-500" />
                    Account Activity
                </h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.byAccount}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="#4b5563" fontSize={10} fontWeight="bold" />
                            <YAxis stroke="#4b5563" fontSize={10} fontWeight="bold" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0d0f1a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="total_inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="total_outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
