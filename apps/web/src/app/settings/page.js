"use client";

import React, { useState } from "react";
import { TopBar } from "@/components/TopBar";
import {
    Settings as SettingsIcon, ShieldCheck, Database,
    Globe, Bell, Moon, Sun, Cpu, Terminal, RefreshCw,
    Lock, HardDrive, Network, Server, Cloud, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Button, Badge, Label } from "@/components/ui";
import { useDateRange } from "@/hooks/useDateRange";

export default function SettingsPage() {
    const { from, to, setFrom, setTo, updateRange, isUpdating: isUpdatingRange } = useDateRange();
    const [activeTab, setActiveTab] = useState('system');

    const sections = [
        { id: 'system', name: 'Executive System', icon: ShieldCheck },
        { id: 'database', name: 'Matrix Source', icon: Database },
        { id: 'network', name: 'Global Network', icon: Network },
        { id: 'security', name: 'Security Protocol', icon: Lock }
    ];

    return (
        <div className="flex flex-col min-h-full bg-[#FBFDFF] animate-fade-in relative">
            <TopBar
                title="System Tuning"
                fromDate={from}
                toDate={to}
                onFromChange={setFrom}
                onToChange={setTo}
                onUpdate={updateRange}
                isUpdating={isUpdatingRange}
            />

            <div className="p-10 space-y-12 pb-32">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 px-1">Control Layer</h3>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Settings Matrix</h1>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        {sections.map(s => (
                            <button
                                key={s.id} onClick={() => setActiveTab(s.id)}
                                className={cn(
                                    "flex items-center gap-3 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                    activeTab === s.id ? "bg-slate-950 text-white shadow-xl shadow-slate-950/20" : "text-slate-400 hover:text-slate-900"
                                )}
                            >
                                <s.icon size={14} /> {s.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* System Health Block */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Interactive Config Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-3xl shadow-slate-200/40 relative overflow-hidden group"
                        >
                            <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-slate-900/5 rounded-full blur-[100px] group-hover:scale-110 transition-all duration-1000" />

                            <div className="relative z-10">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8 px-1">Core Operational Parameters</h4>
                                <div className="space-y-10">
                                    <div className="flex items-center justify-between group/item">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-slate-950 group-hover/item:text-white transition-all shadow-sm">
                                                <Moon size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xl font-black text-slate-950 tracking-tight uppercase">Nocturnal Protocol</p>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Dark mode visualization overrides</p>
                                            </div>
                                        </div>
                                        <div className="w-16 h-8 bg-slate-100 rounded-full relative p-1 cursor-pointer">
                                            <div className="w-6 h-6 bg-white rounded-full shadow-md" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between group/item">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-slate-950 group-hover/item:text-white transition-all shadow-sm">
                                                <Bell size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xl font-black text-slate-950 tracking-tight uppercase">Telemetry Alerts</p>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Real-time system event broadcasting</p>
                                            </div>
                                        </div>
                                        <div className="w-16 h-8 bg-emerald-500 rounded-full relative p-1 cursor-pointer flex justify-end shadow-lg shadow-emerald-500/20">
                                            <div className="w-6 h-6 bg-white rounded-full shadow-md" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between group/item">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-slate-950 group-hover/item:text-white transition-all shadow-sm">
                                                <Globe size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xl font-black text-slate-950 tracking-tight uppercase">Multi-Regional Currency</p>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Global valuation synchronization</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-slate-950 text-white font-black px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest border-none h-10 shadow-xl">PKR ENABLED</Badge>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-950 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-slate-950/20">
                                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400">
                                        <Server size={24} />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Instance Sync</h4>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-3xl font-black tracking-tighter">API_ACTIVE</p>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Latency: 24ms</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-10 relative overflow-hidden group">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                                        <Cloud size={24} />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Cloud Status</h4>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Deployed</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Version: 2.1.0-STABLE</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white border border-slate-100 rounded-[3.5rem] p-10 shadow-xl shadow-slate-200/30">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8 px-1">Telemetry Monitor</h4>
                            <div className="space-y-6">
                                {[
                                    { label: 'CPU LOAD', value: '12%', color: 'from-blue-500 to-blue-400' },
                                    { label: 'MEM INDEX', value: '45%', color: 'from-emerald-500 to-emerald-400' },
                                    { label: 'IO FLUX', value: '08%', color: 'from-amber-500 to-amber-400' },
                                    { label: 'OPS MATRIX', value: '100%', color: 'from-rose-500 to-rose-400' }
                                ].map((s, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-end px-1">
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{s.label}</span>
                                            <span className="text-xs font-black text-slate-950 tracking-tighter">{s.value}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }} animate={{ width: s.value }} transition={{ duration: 2, ease: "circOut" }}
                                                className={cn("h-full rounded-full shadow-lg", s.color)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-[3.5rem] p-10 shadow-xl shadow-slate-200/30 flex flex-col items-center text-center group">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-6 group-hover:bg-slate-950 group-hover:text-white transition-all duration-700 shadow-sm">
                                <Zap size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Rapid Sync</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 mb-8 px-4">Force global refresh and cache termination</p>
                            <Button className="w-full h-14 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-900/10 hover:translate-y-[-2px] transition-all">
                                <RefreshCw size={18} className="mr-2" /> EXECUTE SYNC
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto px-10 py-6 border-t border-slate-50 bg-[#FBFDFF] text-center">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">System Core Configuration - ENCRYPTED CHANNEL</p>
            </div>
        </div>
    );
}

const cn = (...classes) => classes.filter(Boolean).join(" ");
