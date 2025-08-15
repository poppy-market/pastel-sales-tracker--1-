import { DateRangeFilter } from '../types';

export const getFilterDates = (filter: DateRangeFilter): { start: Date; end: Date } => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (filter) {
        case DateRangeFilter.THIS_WEEK:
            start = new Date(now.setDate(now.getDate() - now.getDay()));
            end = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            break;
        case DateRangeFilter.LAST_WEEK:
            start = new Date(now.setDate(now.getDate() - now.getDay() - 7));
            end = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            break;
        case DateRangeFilter.LAST_MONTH:
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
    }
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
};

export const getWeekRange = (dateForWeek: Date): { start: Date; end: Date } => {
    const d = new Date(dateForWeek);
    d.setHours(0, 0, 0, 0);
    const dayOfWeek = d.getDay(); // Sun: 0, ..., Wed: 3, ...
    // Our week starts on Wednesday
    const offset = (dayOfWeek - 3 + 7) % 7;
    
    const start = new Date(d);
    start.setDate(d.getDate() - offset);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
};


export const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD
};

export const formatFriendlyDateTime = (date: Date): string => {
    if (!date || isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};