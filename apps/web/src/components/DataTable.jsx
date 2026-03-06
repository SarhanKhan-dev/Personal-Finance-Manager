import React from "react";
import { cn } from "@/lib/utils";

export const DataTable = ({ columns, data, className }) => {
    return (
        <div className={cn("w-full overflow-hidden", className)}>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr>
                        {columns.map((column, idx) => (
                            <th
                                key={column.accessor || idx}
                                className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-50"
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {(Array.isArray(data) ? data : []).map((row, rowIdx) => (
                        <tr
                            key={row.id || rowIdx}
                            className="group hover:bg-slate-50/50 transition-all duration-300"
                        >
                            {columns.map((column, colIdx) => (
                                <td key={column.accessor || colIdx} className="px-6 py-5 text-sm text-slate-600 font-bold tracking-tight">
                                    {column.cell ? column.cell(row) : (
                                        <span className="group-hover:text-slate-900 transition-colors">
                                            {row[column.accessor]}
                                        </span>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-xs font-black text-slate-300 uppercase tracking-widest">
                                No records found in set
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

