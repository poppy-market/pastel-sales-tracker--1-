
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SessionLog, BonusTargets, WeeklyStatsData } from '../types';
import { getSessionLogs, addSessionLog, getBonusTargets, getWeeklyStats, getSessionLogsEdge } from '../services/storage';
import { formatFriendlyDateTime, getWeekRange } from '../utils/date';
import { Card, Button, Modal, Input } from './common/UI';
import { PlusIcon, LogoutIcon, UserIcon as ProfileIcon, EditIcon, SaveIcon, CalendarIcon, TShirtIcon, TagIcon } from './Icons';
import { FaRegListAlt, FaMoneyBillWave, FaChartBar } from 'react-icons/fa';
import SellerProfile from './SellerProfile';
import { DateTimePickerModal } from './common/DateTimePicker';
import { ProjectedPayoutCard, WeeklyStatCard, DailyStatCard } from './dashboard/DashboardComponents';
import { WeekNavigator } from './dashboard/DashboardControls';


const SellerHeader: React.FC<{ onNavigate: (page: 'dashboard' | 'profile') => void; activePage: string; }> = ({ onNavigate, activePage }) => {
    const { user, logout } = useAuth();
    return (
        <header className="p-4">
             <Card className="!py-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                                                <span className="inline-flex items-center justify-center w-20 h-20">
                                                    <img src="https://sofia.static.domains/Logos/poppy_icon_512x512_transparent.png" alt="Poppy Icon" className="w-20 h-20 object-contain" />
                                                </span>
                        <div>
                            <h1 className="font-bold text-xl">{user?.name}</h1>
                            <p className="text-base text-gray-600 font-medium">Seller Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => onNavigate('profile')} className={activePage === 'profile' ? 'bg-gray-200' : ''}>
                            <EditIcon className="w-5 h-5" /> <span className="hidden sm:inline">Profile</span>
                        </Button>
                        <Button variant="primary" className="!bg-pink-400 !hover:bg-pink-500 !border-pink-400/50" onClick={logout}>
                            <LogoutIcon className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </Card>
        </header>
    );
};

const LogSessionForm: React.FC<{onClose: () => void, onSave: () => void}> = ({onClose, onSave}) => {
    const { user } = useAuth();
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [brandedItems, setBrandedItems] = useState(0);
    const [freeSizeItems, setFreeSizeItems] = useState(0);
    const [pickerState, setPickerState] = useState<{isOpen: boolean; field: 'start' | 'end'; title: string; date: Date}>({
        isOpen: false,
        field: 'start',
        title: '',
        date: new Date()
    });
    const [error, setError] = useState<string | null>(null);

    const durationString = useMemo(() => {
        const durationMs = endTime.getTime() - startTime.getTime();
        if (durationMs < 0) {
            return 'Invalid time range';
        }
        const totalMinutes = Math.floor(durationMs / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return `${hours}h ${minutes}m`;
    }, [startTime, endTime]);

    const openPicker = (field: 'start' | 'end') => {
        setPickerState({
            isOpen: true,
            field,
            title: field === 'start' ? 'Select Start Time' : 'Select End Time',
            date: field === 'start' ? startTime : endTime
        });
    };
    
    const handlePickerApply = (date: Date) => {
        if (pickerState.field === 'start') {
            setStartTime(date);
            if (date > endTime) {
                setEndTime(date);
            }
        } else {
            setEndTime(date);
        }
        setPickerState({ ...pickerState, isOpen: false });
    };

    const handlePickerClose = () => {
        setPickerState({ ...pickerState, isOpen: false });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!user) return;
        if (endTime < startTime) {
            setError('End date/time cannot be before start date/time.');
            return;
        }
        try {
            await addSessionLog({
                sellerId: user.id,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                brandedItemsSold: Number(brandedItems),
                freeSizeItemsSold: Number(freeSizeItems)
            });
            onSave();
            onClose();
        } catch (err: any) {
            setError('Failed to save session. Please try again.');
        }
    };

    const DateTimeButton: React.FC<{label: string, date: Date, onClick: () => void}> = ({label, date, onClick}) => (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
            <button
                type="button"
                onClick={onClick}
                className="w-full text-left p-3 rounded-lg border-2 border-gray-300 focus:border-pink-400 focus:ring-pink-400 focus:outline-none transition duration-200 bg-white/80 flex justify-between items-center"
                aria-label={`Change ${label}`}
            >
                <span>{formatFriendlyDateTime(date)}</span>
                <CalendarIcon className="w-5 h-5 text-gray-500" />
            </button>
        </div>
    );

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                <DateTimeButton label="Start Date & Time" date={startTime} onClick={() => openPicker('start')} />
                <DateTimeButton label="End Date & Time" date={endTime} onClick={() => openPicker('end')} />
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Duration</label>
                    <div className="w-full p-3 rounded-lg border-2 border-gray-300 bg-gray-100/80 text-gray-600 font-medium text-center">
                        {durationString}
                    </div>
                </div>
                {error && (
                    <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded-lg text-center font-semibold shadow animate-fade-in">
                        {error}
                    </div>
                )}
                <Input icon={<TShirtIcon className="w-5 h-5 text-gray-400" />} label="Branded Items Sold" type="number" value={brandedItems} onChange={e => setBrandedItems(Number(e.target.value))} min="0" required/>
                <Input icon={<TagIcon className="w-5 h-5 text-gray-400" />} label="Free Size Items Sold" type="number" value={freeSizeItems} onChange={e => setFreeSizeItems(Number(e.target.value))} min="0" required/>
                <Button type="submit" className="w-full">
                    <SaveIcon className="w-5 h-5" /> Save Session
                </Button>
            </form>
            <DateTimePickerModal 
                isOpen={pickerState.isOpen}
                onClose={handlePickerClose}
                onApply={handlePickerApply}
                initialDate={pickerState.date}
                title={pickerState.title}
                minDate={pickerState.field === 'end' ? startTime : undefined}
                maxDate={pickerState.field === 'start' ? endTime : undefined}
            />
        </>
    );
}

type SortableKeys = keyof SessionLog | 'total' | 'sellerName';

export const SortableHeader: React.FC<{
    title: string;
    sortKey: SortableKeys;
    sortConfig: { key: string; direction: string } | null;
    requestSort: (key: SortableKeys) => void;
    className?: string;
}> = ({ title, sortKey, sortConfig, requestSort, className = '' }) => {
    const isSorted = sortConfig?.key === sortKey;
    const directionIcon = isSorted ? (sortConfig?.direction === 'ascending' ? '▲' : '▼') : '';

    return (
        <th className={`p-2 font-semibold text-gray-600 text-sm ${className}`}>
            <button onClick={() => requestSort(sortKey)} className="flex items-center gap-1 w-full justify-center">
                {title}
                <span className="text-pink-400 text-xs w-2">{isSorted && directionIcon}</span>
            </button>
        </th>
    );
};


const SellerDashboard: React.FC<{onNavigate: (page: 'dashboard' | 'profile') => void}> = ({ onNavigate }) => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<SessionLog[]>([]); // For the recent logs table
    const [targets, setTargets] = useState<BonusTargets | null>(null); // For displaying targets
    const [stats, setStats] = useState<WeeklyStatsData | null>(null); // For all dashboard cards
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>({ key: 'startTime', direction: 'descending' });
    const [currentDate, setCurrentDate] = useState(new Date());
    const [logSuccess, setLogSuccess] = useState(false);

    // Show success message for 2.5 seconds when logSuccess is true
    useEffect(() => {
        if (logSuccess) {
            const timer = setTimeout(() => setLogSuccess(false), 2500);
            return () => clearTimeout(timer);
        }
    }, [logSuccess]);
    
    const fetchDashboardData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        // Calculate week range (Wednesday start, Manila time)
        const { start: weekStart, end: weekEnd } = getWeekRange(currentDate);
        // Align week boundaries with Supabase SQL: weekStart is UTC midnight at start of week, weekEnd is UTC midnight at start of the day after the week (exclusive)
        // Ensure week always starts on Wednesday (UTC)
        let ws = new Date(weekStart);
        if (ws.getUTCDay() !== 3) {
            const daysToAdd = (3 - ws.getUTCDay() + 7) % 7;
            ws.setUTCDate(ws.getUTCDate() + daysToAdd);
        }
        const weekStartUTC = new Date(Date.UTC(ws.getUTCFullYear(), ws.getUTCMonth(), ws.getUTCDate(), 0, 0, 0, 0));
        const weekEndUTC = new Date(weekStartUTC);
        weekEndUTC.setUTCDate(weekEndUTC.getUTCDate() + 7);
        function toUTCISOString(date: Date) {
            return date.toISOString().slice(0, 19) + 'Z';
        }
        const params = {
            sellerId: user.id,
            weekStart: toUTCISOString(weekStartUTC),
            weekEnd: toUTCISOString(weekEndUTC),
        };
        try {
            const result = await getSessionLogsEdge(params);
            if (Array.isArray(result)) {
                setLogs([]);
                setStats(null);
                return;
            }
            const logs = result.logs || [];
            const stats = result.stats || null;
            const mappedLogs = logs.map(log => ({
                ...log,
                startTime: log.start_time_manila || log.start_time,
                brandedItemsSold: log.branded_items_sold,
                freeSizeItemsSold: log.free_size_items_sold,
            }));
            setLogs(mappedLogs);
            const bonusTargets = await getBonusTargets();
            setTargets(bonusTargets);
            setStats(stats);
        } catch (err) {
            setLogs([]);
            setStats(null);
            // Optionally, set an error message state to display to the user
        } finally {
            setIsLoading(false);
        }
    }, [user, currentDate]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Sorting and Pagination logic
    const requestSort = (key: SortableKeys) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const sortedLogs = useMemo(() => {
        let sortableLogs = [...logs];
        if (sortConfig !== null) {
            sortableLogs.sort((a, b) => {
                let aValue: any;
                let bValue: any;
                
                if (sortConfig.key === 'total') {
                    aValue = a.brandedItemsSold + a.freeSizeItemsSold;
                    bValue = b.brandedItemsSold + b.freeSizeItemsSold;
                } else if (sortConfig.key === 'startTime') {
                    aValue = new Date(a.startTime).getTime();
                    bValue = new Date(b.startTime).getTime();
                }
                 else {
                    aValue = a[sortConfig.key as keyof SessionLog];
                    bValue = b[sortConfig.key as keyof SessionLog];
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableLogs;
    }, [logs, sortConfig]);

    const rowsPerPage = 10;
    const totalPages = Math.ceil(sortedLogs.length / rowsPerPage);
    const paginatedLogs = sortedLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };


    if (isLoading) {
        return <div className="p-4 text-center">Loading dashboard...</div>;
    }

    if (!stats || !targets) {
        return <div className="p-4 text-center">Could not load dashboard data.</div>;
    }

    return (

                <div className="p-4 pt-6 space-y-6 pb-24">
                    <WeekNavigator currentDate={currentDate} onDateChange={setCurrentDate} />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <FaMoneyBillWave size={24} color="#22c55e" />
                                <span className="font-bold text-xl text-gray-800">Projected Payout</span>
                            </div>
                            <ProjectedPayoutCard payout={stats.payout} />
                        </div>
                        <div className="md:col-span-2">
                            <div className="mb-3 flex items-center gap-2">
                                <FaChartBar size={24} color="#a78bfa" />
                                <span className="font-bold text-xl text-gray-800">Weekly Summary</span>
                            </div>
                            <WeeklyStatCard stats={stats} targets={targets} weekDateRange={stats.weekDateRange} />
                        </div>
                    </div>

                    <div className="mt-6 mb-3 flex items-center gap-2">
                        <span className="text-purple-500 w-6 h-6 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </span>
                        <span className="font-bold text-xl text-gray-800">Daily Breakdown</span>
                    </div>
                    <div className="relative">
                        <div className="flex gap-4 overflow-x-auto no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
                            {stats.dailyStats && Array.isArray(stats.dailyStats)
                                ? stats.dailyStats.map((dayData, index) => (
                                    <DailyStatCard key={dayData.dayName + '-' + (dayData.date ? new Date(dayData.date).getTime() : index)} dayData={dayData} targets={targets} />
                                ))
                                : null}
                        </div>
                    </div>

            <Card>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FaRegListAlt size={24} color="#a78bfa" /> Recent Sales Logs</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-base rounded-2xl overflow-hidden shadow-sm">
                        <thead className="border-b-2 border-pink-100 bg-gradient-to-r from-pink-50/80 to-blue-50/80">
                            <tr>
                                <SortableHeader title="Date" sortKey="startTime" sortConfig={sortConfig} requestSort={requestSort} className="text-left !justify-start pl-2" />
                                <SortableHeader title="Branded" sortKey="brandedItemsSold" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader title="Free Size" sortKey="freeSizeItemsSold" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader title="Total" sortKey="total" sortConfig={sortConfig} requestSort={requestSort} />
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length > 0 ? paginatedLogs.map((log, idx) => {
                                // Use start_time for date, fallback to created_at
                                const dateStr = log.startTime || log.created_at;
                                const date = dateStr ? new Date(dateStr) : null;
                                const formattedDate = date && !isNaN(date.getTime()) ? date.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' }) : '—';
                                const branded = Number(log.brandedItemsSold) || 0;
                                const freeSize = Number(log.freeSizeItemsSold) || 0;
                                const total = branded + freeSize;
                                // Alternate pastel row backgrounds
                                const rowBg = idx % 2 === 0 ? 'bg-pink-50/60' : 'bg-blue-50/40';
                                return (
                                    <tr key={log.id} className={`${rowBg} border-b border-pink-100 last:border-b-0 hover:bg-pink-100/60 transition-all`}>
                                        <td className="p-2 text-gray-700 text-base rounded-l-xl">{formattedDate}</td>
                                        <td className="p-2 text-gray-800 text-center text-base">{branded}</td>
                                        <td className="p-2 text-gray-800 text-center text-base">{freeSize}</td>
                                        <td className="p-2 font-bold text-gray-900 text-center text-base rounded-r-xl">{total}</td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={4} className="text-center p-8 text-gray-500">No sales logged yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-200">
                        <Button
                            variant="secondary"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="!py-1 !px-3 text-sm"
                        >
                            &larr; Previous
                        </Button>
                        <span className="text-sm font-semibold text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="secondary"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="!py-1 !px-3 text-sm"
                        >
                            Next &rarr;
                        </Button>
                    </div>
                )}
            </Card>

            {logSuccess && (
                <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg text-center font-semibold shadow mb-2 animate-fade-in fixed bottom-24 right-6 z-50">
                    Log saved successfully!
                </div>
            )}
            <Button 
                variant="primary" 
                onClick={() => setIsModalOpen(true)}
                className="!rounded-full !w-14 !h-14 !p-0 fixed bottom-6 right-6 z-40 shadow-xl"
                aria-label="Log New Sales Session"
            >
                <PlusIcon className="w-8 h-8"/>
            </Button>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log New Sales Session">
                <LogSessionForm onClose={() => setIsModalOpen(false)} onSave={() => { fetchDashboardData(); setLogSuccess(true); }} />
            </Modal>
        </div>
    );
};

export default function SellerView() {
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'profile'>('dashboard');
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto">
            <SellerHeader onNavigate={setCurrentPage} activePage={currentPage} />
            <main>
                {currentPage === 'dashboard' && <SellerDashboard onNavigate={setCurrentPage} />}
                {currentPage === 'profile' && <SellerProfile onNavigateBack={() => setCurrentPage('dashboard')} />}
            </main>
        </div>
    )
}
