/**
 * Utility to get date strings in Asia/Kolkata (IST) timezone.
 * Returns YYYY-MM-DD
 */
export const getTodayStr = (): string => {
    return new Intl.DateTimeFormat('en-ZA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
};

export const getTomorrowStr = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return new Intl.DateTimeFormat('en-ZA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(tomorrow);
};
