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

export const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const match = timeStr.match(/^(\d{2}):(\d{2})(AM|PM)$/);
    if (!match) return 0;
    let [_, hours, minutes, ampm] = match;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
};

export const isEndTimeValid = (startTime, endTime) => {
    if (!startTime || !endTime) return true;
    return timeToMinutes(endTime) > timeToMinutes(startTime);
};
