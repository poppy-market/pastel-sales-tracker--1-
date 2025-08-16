import React from 'react';
import { Card, Tooltip } from '../common/UI';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { BonusTargets } from '../../types';
import { CheckCircleIcon } from '../Icons';
import { FaMoneyBillWave, FaCalendarDay } from 'react-icons/fa';
import { FaChartBar, FaShoppingBag, FaStopwatch } from 'react-icons/fa';
// Helper to format week date range string
function formatWeekDateRange(weekDateRange: string) {
    if (!weekDateRange) return '';
    const [start, end] = weekDateRange.split(' - ');
    if (!start || !end) return weekDateRange;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return weekDateRange;
    // Subtract 1 day from end date
    endDate.setDate(endDate.getDate() - 1);
    const options = { year: 'numeric', month: 'short', day: 'numeric' } as const;
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
}

const StatRow: React.FC<{ label: string, value: string | number, highlight?: boolean, valueClass?: string, labelClass?: string }> = ({ label, value, highlight = false, valueClass = '', labelClass = '' }) => (
    <div className={`flex justify-between items-baseline ${highlight ? 'font-bold' : ''}`}>
        <p className={`text-sm text-gray-600 ${labelClass}`}>{label}</p>
        <p className={`text-right text-sm font-semibold ${valueClass}`}>{value}</p>
    </div>
);

const ProgressStat: React.FC<{ label: string, value?: number, target?: number, unit?: string, hideTarget?: boolean }> = ({ label, value = 0, target = 0, unit = '', hideTarget = false }) => {
    const isSuccess = target > 0 && value >= target;
    const percent = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
    return (
        <div className="mb-2">
            <div className="flex justify-between items-baseline text-sm">
                <p className="text-gray-600">{label}</p>
                <div className="font-semibold flex items-center gap-1">
                    {isSuccess && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                    <span className={isSuccess ? 'text-green-600' : 'text-gray-800'}>
                        {Math.round(value ?? 0)}{unit}
                    </span>
                    {!hideTarget && <span className="text-gray-500 font-normal"> / {Math.round(target ?? 0)}{unit}</span>}
                </div>
            </div>
            {target > 0 && (
                <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${isSuccess ? 'bg-green-400' : 'bg-pink-400'}`}
                        style={{ width: `${percent}%` }}
                    ></div>
                </div>
            )}
        </div>
    );
};

export const DailyStatCard: React.FC<{dayData: any, targets: BonusTargets}> = ({dayData, targets}) => {
    // Handle missing or empty data
    const isEmpty = !dayData || Object.keys(dayData).length === 0;
    return (
        <div className="flex-shrink-0 w-[240px] sm:w-[260px] min-h-[320px] flex flex-col rounded-2xl overflow-hidden" style={{ scrollSnapAlign: 'start' }}>
            <Card className="h-full flex flex-col justify-between rounded-2xl overflow-hidden">
                {isEmpty ? (
                    <div className="flex flex-1 items-center justify-center text-gray-400 min-h-[200px]">
                        No data available
                    </div>
                ) : (
                    <>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <span className="text-blue-400 w-5 h-5 flex items-center justify-center"><FaCalendarDay size={18} /></span>
                          {dayData.dayName}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">{new Date(dayData.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</p>
                        <div className="space-y-2">
                            <ProgressStat label="Branded Items" value={dayData.brandedItemsSold} target={targets.dailyTargetBrandedItems} />
                            <ProgressStat label="Free Size Items" value={dayData.freeSizeItemsSold} target={targets.dailyTargetFreeSizeItems} />
                            <StatRow label="Total Items" value={dayData.totalItems} />
                            <hr className="my-2 border-pink-100"/>
                            <ProgressStat label="Duration" value={dayData.durationHours} target={targets.dailyTargetDurationHours} unit="h" />
                            <hr className="my-2 border-pink-100"/>
                            <StatRow label="Base Pay" value={`₱${(dayData.basePay ?? 0).toLocaleString()}`} />
                                                                                    <StatRow 
                                                                                        label={
                                                                                            <span className="flex items-center gap-1">
                                                                                                Bonus
                                                                                                <Tooltip content={`Daily Bonus: ₱${(targets.dailyBonusAmount ?? 0).toLocaleString()}`}>
                                                                                                    <span tabIndex={0} className="focus:outline-none cursor-pointer">
                                                                                                                                                <span className="transition-colors text-pink-400 hover:text-pink-600">
                                                                                                                                                    <FaRegQuestionCircle size={16} color="currentColor" />
                                                                                                                                                </span>
                                                                                                    </span>
                                                                                                </Tooltip>
                                                                                            </span>
                                                                                        }
                                                                                        value={`₱${(dayData.bonus ?? 0).toLocaleString()}`} 
                                                                                        valueClass={dayData.bonus > 0 ? 'text-green-600' : ''}
                                                                                    />
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};
export const WeeklyStatCard: React.FC<{stats: any, targets: BonusTargets, weekDateRange: string}> = ({stats, targets, weekDateRange}) => {
    return (
    <Card className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-4">{formatWeekDateRange(weekDateRange)}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                 <div>
                    <h4 className="font-semibold mb-1 text-purple-800 flex items-center gap-1">
                        <span className="text-pink-400 w-4 h-4 flex items-center justify-center"><FaShoppingBag size={16} /></span>
                        Sales
                    </h4>
                    <ProgressStat label="Branded Items" value={stats.weeklyTotals.brandedItemsSold} target={targets.weeklyTargetBrandedItems} />
                    <ProgressStat label="Free Size Items" value={stats.weeklyTotals.freeSizeItemsSold} target={targets.weeklyTargetFreeSizeItems} />
                    <StatRow label="Total Items" value={stats.weeklyTotals.totalItems} />
                </div>
                 <div>
                    <h4 className="font-semibold mb-1 text-purple-800 flex items-center gap-1">
                        <span className="text-blue-400 w-4 h-4 flex items-center justify-center"><FaStopwatch size={16} /></span>
                        Performance
                    </h4>
                    <ProgressStat label="Total Duration" value={stats.weeklyTotals.durationHours} target={targets.weeklyTargetDurationHours} unit="h" />
                                                            <StatRow 
                                                                label={
                                                                    <span className="flex items-center gap-1">
                                                                        Weekly Bonus
                                                                        <Tooltip content={`Weekly Bonus: ₱${(targets.weeklyBonusAmount ?? 0).toLocaleString()}`}>
                                                                            <span tabIndex={0} className="focus:outline-none cursor-pointer">
                                                                                                                <span className="transition-colors text-pink-400 hover:text-pink-600">
                                                                                                                    <FaRegQuestionCircle size={16} color="currentColor" />
                                                                                                                </span>
                                                                            </span>
                                                                        </Tooltip>
                                                                    </span>
                                                                }
                                                                value={`₱${stats.weeklyTotals.bonus.toLocaleString()}`} 
                                                                valueClass={stats.weeklyTotals.bonus > 0 ? 'text-green-600' : ''} 
                                                            />
                </div>
            </div>
        </Card>
    )
    // ...existing code...
}

export const ProjectedPayoutCard: React.FC<{payout: any}> = ({payout}) => {
    return (
    <Card className="md:col-span-1">
            <div className="space-y-2">
                <StatRow label="Total Base Pay" value={`₱${Math.round(payout.basePay).toLocaleString()}`} />
                <StatRow label="Total Bonuses" value={`₱${Math.round(payout.bonuses).toLocaleString()}`} />
                {payout.bonuses > 0 && (
                     <div className="pl-4 mt-1 space-y-1 border-l-2 border-green-200">
                        <StatRow label="Daily Bonuses" value={`₱${payout.dailyBonuses.toLocaleString()}`} valueClass="text-gray-700" labelClass="text-gray-500" />
                        <StatRow label="Weekly Bonus" value={`₱${payout.weeklyBonus.toLocaleString()}`} valueClass="text-gray-700" labelClass="text-gray-500"/>
                    </div>
                )}
                <hr className="my-3"/>
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-green-900">Total Payout</p>
                    <p className="font-extrabold text-2xl text-green-900">₱{Math.round(payout.total).toLocaleString()}</p>
                </div>
            </div>
        </Card>
    )
}
