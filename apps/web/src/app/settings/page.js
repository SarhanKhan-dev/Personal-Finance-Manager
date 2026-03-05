"use client";

import React from "react";
import { TopBar } from "@/components/TopBar";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
    return (
        <div className="flex flex-col h-full bg-slate-50 animate-fade-in">
            <TopBar
                title="Settings"
                fromDate={new Date().toISOString().split('T')[0]}
                toDate={new Date().toISOString().split('T')[0]}
                onFromChange={() => { }}
                onToChange={() => { }}
                onUpdate={() => { }}
            />
            <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-pastel-yellow flex items-center justify-center text-amber-600 shadow-premium">
                    <SettingsIcon size={32} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Configuration</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">This module is under executive review</p>
                </div>
            </div>
        </div>
    );
}
