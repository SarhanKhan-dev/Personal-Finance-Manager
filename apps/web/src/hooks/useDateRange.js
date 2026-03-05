"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useState, useCallback, useEffect } from "react";

export function useDateRange() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const fromParam = searchParams.get("from") || format(startOfMonth(new Date()), "yyyy-MM-dd");
    const toParam = searchParams.get("to") || format(endOfMonth(new Date()), "yyyy-MM-dd");

    const [range, setRange] = useState({ from: fromParam, to: toParam });
    const [isUpdating, setIsUpdating] = useState(false);

    const updateRange = useCallback(() => {
        setIsUpdating(true);
        const params = new URLSearchParams(searchParams);
        params.set("from", range.from);
        params.set("to", range.to);
        router.push(`${pathname}?${params.toString()}`);
        setTimeout(() => setIsUpdating(false), 800);
    }, [range, pathname, searchParams, router]);

    const setFrom = (val) => setRange(p => ({ ...p, from: val }));
    const setTo = (val) => setRange(p => ({ ...p, to: val }));

    return {
        from: range.from,
        to: range.to,
        setFrom,
        setTo,
        updateRange,
        isUpdating,
    };
}
