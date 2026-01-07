export const TIME_OPTIONS = (() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 5) {
            const h = hour % 12 || 12;
            const ampm = hour < 12 ? 'AM' : 'PM';
            const m = minute.toString().padStart(2, '0');
            const hStr = h.toString().padStart(2, '0');
            options.push(`${hStr}:${m}${ampm}`);
        }
    }
    return options;
})();
