// 1️⃣ Overload signatures
export function convertUtcToTimeZone(utcDate: string | Date): string;
export function convertUtcToTimeZone(utcDate: string | Date, timeZone: string): string;

// 2️⃣ Single implementation
export function convertUtcToTimeZone(utcDate: string | Date, timeZone?: string): string {
    const date = new Date(utcDate);
    // If no timezone passed, get from localStorage
    const tz = timeZone ?? JSON.parse(localStorage.getItem("timeZone") || '"UTC"');

    return new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(date);
}

export function getUtcDayBoundaries(daysAgo = 0) {
    const now = new Date();
    const localStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

    return localStart.toISOString();
}
