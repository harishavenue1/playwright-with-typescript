"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDateFromRelative = void 0;
const date_fns_1 = require("date-fns");
function getDateFromRelative(input) {
    const lower = input.trim().toLowerCase();
    const today = new Date();
    if (lower === 'today')
        return today;
    if (lower === 'tomorrow')
        return addDays(today, 1);
    const match = lower.match(/^(\d+)\s+days?\s+from\s+now$/);
    if (match)
        return addDays(today, parseInt(match[1], 10));
    // fallback: try parsing as ISO date
    return (0, date_fns_1.parseISO)(input);
}
exports.getDateFromRelative = getDateFromRelative;
function addDays(today, days) {
    const result = new Date(today);
    result.setDate(result.getDate() + days);
    return result;
}
