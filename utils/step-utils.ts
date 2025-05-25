import { parseISO } from "date-fns";

export function getDateFromRelative(input: string): Date {
    const lower = input.trim().toLowerCase();
    const today = new Date();
    if (lower === 'today') return today;
    if (lower === 'tomorrow') return addDays(today, 1);
    if (lower === 'next week') return addDays(today, 8);
    if (lower === 'next month') return addDays(today, 30);
    const match = lower.match(/^(\d+)\s+days?\s+from\s+now$/);
    if (match) return addDays(today, parseInt(match[1], 10));
    // fallback: try parsing as ISO date
    return parseISO(input);
}

function addDays(today: Date, days: number): Date {
    const result = new Date(today);
    result.setDate(result.getDate() + days);
    return result;
}
