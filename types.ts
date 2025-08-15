
export enum UserRole {
    ADMIN = 'ADMIN',
    SELLER = 'SELLER',
}

export interface User {
    id: number;
    auth_id?: string;
    name: string;
    username: string;
    email: string;
    role: UserRole;
    phone?: string;
    gcash?: string;
}

export interface SessionLog {
    id: string;
    sellerId: number;
    startTime: string;
    endTime: string;
    brandedItemsSold: number;
    freeSizeItemsSold: number;
}

export interface BonusTargets {
    dailyTargetBrandedItems: number;
    dailyTargetFreeSizeItems: number;

    dailyBonusAmount: number;
    weeklyTargetBrandedItems: number;
    weeklyTargetFreeSizeItems: number;
    weeklyBonusAmount: number;
    basePayPerHour: number;
    dailyTargetDurationHours: number;
    weeklyTargetDurationHours: number;
}

export enum DateRangeFilter {
    THIS_WEEK = 'This Week',
    LAST_WEEK = 'Last Week',
    LAST_MONTH = 'Last Month',
    CUSTOM = 'Custom',
}

// --- Types for Backend Stats Calculation ---

export interface DailyStat {
    date: string; // Comes as string from backend, converted to Date object in service
    dayName: string;
    brandedItemsSold: number;
    freeSizeItemsSold: number;
    durationHours: number;
    basePay: number;
    bonus: number;
}

export interface WeeklyTotals {
    brandedItemsSold: number;
    freeSizeItemsSold: number;
    totalItems: number;
    durationHours: number;
    bonus: number;
}

export interface Payout {
    basePay: number;
    bonuses: number;
    dailyBonuses: number;
    weeklyBonus: number;
    total: number;
}

export interface WeeklyStatsData {
    dailyStats: DailyStat[];
    weeklyTotals: WeeklyTotals;
    payout: Payout;
    weekDateRange: string;
}
