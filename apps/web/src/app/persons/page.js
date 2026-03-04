"use client";

import { useEffect, useState } from 'react';
import {
    Users,
    UserPlus,
    Phone,
    Trash2,
    MessageSquare,
    ChevronRight,
    MoreVertical,
    Search
} from "lucide-react";

export default function Persons() {
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    async function fetchPersons() {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/persons`);
            setPersons(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPersons();
    }, []);

    const filtered = persons.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone?.includes(search));

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Person Directory</h1>
                    <p className="text-gray-400 mt-1 font-medium italic">Manage contacts for loans and payments.</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <UserPlus size={18} />
                    <span>Add Person</span>
                </button>
            </div>

            <div className="relative max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text" placeholder="Search persons..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="input-finance pl-11"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((person) => (
                    <div key={person.id} className="card-finance p-6 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-full bg-accent-500/10 flex items-center justify-center text-accent-500 text-xl font-black border-2 border-accent-500/20 shadow-glow-sm">
                                {person.name[0].toUpperCase()}
                            </div>
                            <button className="p-2 text-gray-600 hover:text-white transition-colors">
                                <MoreVertical size={18} />
                            </button>
                        </div>

                        <h3 className="text-lg font-bold text-white truncate">{person.name}</h3>

                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Phone size={14} className="text-accent-500/60" />
                                <span className="text-xs font-bold">{person.phone || 'No phone number'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <MessageSquare size={14} className="text-accent-500/60" />
                                <span className="text-xs font-medium truncate italic">"{person.notes || 'No notes...'}"</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center group">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">View Profile</span>
                            <div className="p-2 rounded-lg bg-bg-800 text-gray-500 group-hover:bg-accent-500 group-hover:text-white transition-all">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
