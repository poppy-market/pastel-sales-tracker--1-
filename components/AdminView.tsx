
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BonusTargets, SessionLog, User, UserRole, WeeklyStatsData } from '../types';
import * as storage from '../services/storage';
import { Card, Button, Input, Modal } from './common/UI';
import { LogoutIcon, SaveIcon, PesoSignIcon, CalendarIcon, EditIcon, MenuIcon, UserIcon as ProfileIcon, TShirtIcon, TagIcon, ClockIcon } from './Icons';

import { DateTimePickerModal } from './common/DateTimePicker';
import { SortableHeader } from './SellerView'; 
import { formatFriendlyDateTime, getWeekRange } from '../utils/date';
import UserManagement from './UserManagement';
import { ProjectedPayoutCard, WeeklyStatCard, DailyStatCard } from './dashboard/DashboardComponents';
import { WeekNavigator } from './dashboard/DashboardControls';


const SettingsPage: React.FC = () => {
    const [targets, setTargets] = useState<BonusTargets | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchTargets = async () => {
            const currentTargets = await storage.getBonusTargets();
            setTargets(currentTargets);
        };
        fetchTargets();
    }, []);

    if (!targets) {
        return <div className="p-4 text-center">Loading settings...</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTargets({
            ...targets,
            [e.target.name]: Number(e.target.value),
        });
    };

    const handleSaveTargets = async (e: React.FormEvent) => {
        e.preventDefault();
        await storage.setBonusTargets(targets);
        setMessage('Bonus targets updated successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
         <div className="space-y-6">
            <h2 className="text-2xl font-bold">Global Bonus & Pay Settings</h2>
            <p className="text-gray-600">Set sales targets, duration, and pay rates for all sellers. Bonuses are awarded if a seller meets the duration target and either the branded or free-size item target.</p>
             <Card>
                <form onSubmit={handleSaveTargets} className="space-y-6">
                    <div className="p-4 rounded-lg bg-yellow-100/50 border border-yellow-200">
                        <h3 className="font-bold text-lg text-yellow-800 flex items-center gap-2"><PesoSignIcon className="w-5 h-5"/> Base Pay</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                             <Input icon={<PesoSignIcon className="w-5 h-5 text-gray-400" />} label="Base Pay (PHP/Hour)" type="number" name="basePayPerHour" value={targets.basePayPerHour} onChange={handleChange} min="0"/>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg bg-pink-100/50 border border-pink-200">
                            <h3 className="font-bold text-lg text-pink-800">Daily Bonus</h3>
                            <div className="space-y-4 mt-2">
                                <Input icon={<TShirtIcon className="w-5 h-5 text-gray-400" />} label="Target Branded Items/Day" type="number" name="dailyTargetBrandedItems" value={targets.dailyTargetBrandedItems} onChange={handleChange} min="0"/>
                                <Input icon={<TagIcon className="w-5 h-5 text-gray-400" />} label="Target Free Size Items/Day" type="number" name="dailyTargetFreeSizeItems" value={targets.dailyTargetFreeSizeItems} onChange={handleChange} min="0"/>
                                <Input icon={<ClockIcon className="w-5 h-5 text-gray-400" />} label="Target Hours/Day" type="number" name="dailyTargetDurationHours" value={targets.dailyTargetDurationHours} onChange={handleChange} min="0"/>
                                <Input icon={<PesoSignIcon className="w-5 h-5 text-gray-400" />} label="Bonus Amount (PHP)" type="number" name="dailyBonusAmount" value={targets.dailyBonusAmount} onChange={handleChange} min="0"/>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-purple-100/50 border border-purple-200">
                            <h3 className="font-bold text-lg text-purple-800">Weekly Bonus</h3>
                            <div className="space-y-4 mt-2">
                                 <Input icon={<TShirtIcon className="w-5 h-5 text-gray-400" />} label="Target Branded Items/Week" type="number" name="weeklyTargetBrandedItems" value={targets.weeklyTargetBrandedItems} onChange={handleChange} min="0"/>
                                 <Input icon={<TagIcon className="w-5 h-5 text-gray-400" />} label="Target Free Size Items/Week" type="number" name="weeklyTargetFreeSizeItems" value={targets.weeklyTargetFreeSizeItems} onChange={handleChange} min="0"/>
                                 <Input icon={<ClockIcon className="w-5 h-5 text-gray-400" />} label="Target Hours/Week" type="number" name="weeklyTargetDurationHours" value={targets.weeklyTargetDurationHours} onChange={handleChange} min="0"/>
                                <Input icon={<PesoSignIcon className="w-5 h-5 text-gray-400" />} label="Bonus Amount (PHP)" type="number" name="weeklyBonusAmount" value={targets.weeklyBonusAmount} onChange={handleChange} min="0"/>
                            </div>
                        </div>
                    </div>
                    <Button type="submit" className="w-full sm:w-auto">
                        <SaveIcon className="w-5 h-5" /> Save Settings
                    </Button>
                </form>
            </Card>
            {message && <div className="fixed bottom-4 right-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-pulse">{message}</div>}
        </div>
    )
}

const EditLogModal: React.FC<{log: SessionLog | null; onClose: () => void; onSave: () => void;}> = ({ log, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<SessionLog>>({});
    const [pickerState, setPickerState] = useState<{isOpen: boolean; field: 'start' | 'end'; title: string; date: Date}>({
        isOpen: false, field: 'start', title: '', date: new Date()
    });

    useEffect(() => {
        if (log) {
            setFormData({
                ...log,
                startTime: log.startTime,
                endTime: log.endTime,
                brandedItemsSold: log.brandedItemsSold,
                freeSizeItemsSold: log.freeSizeItemsSold,
            });
        }
    }, [log]);

    if (!log) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await storage.updateSessionLog(formData as SessionLog);
        onSave();
        onClose();
    };
    
    const openPicker = (field: 'start' | 'end') => {
        const dateStr = field === 'start' ? formData.startTime : formData.endTime;
        setPickerState({
            isOpen: true, field,
            title: field === 'start' ? 'Select Start Time' : 'Select End Time',
            date: dateStr ? new Date(dateStr) : new Date()
        });
    };

    const handlePickerApply = (date: Date) => {
        const newFormData = {...formData, [`${pickerState.field}Time`]: date.toISOString()};
        if(pickerState.field === 'start' && new Date(newFormData.startTime!) > new Date(newFormData.endTime!)) {
            newFormData.endTime = newFormData.startTime;
        }
        setFormData(newFormData);
        setPickerState({ ...pickerState, isOpen: false });
    };

    const DateTimeButton: React.FC<{label: string, dateStr: string | undefined, onClick: () => void}> = ({label, dateStr, onClick}) => (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
            <button
                type="button" onClick={onClick}
                className="w-full text-left p-3 rounded-lg border-2 border-gray-300 focus:border-pink-400 focus:ring-pink-400 focus:outline-none transition duration-200 bg-white/80 flex justify-between items-center"
                aria-label={`Change ${label}`}
            >
                <span>{dateStr ? formatFriendlyDateTime(new Date(dateStr)) : 'Select date'}</span>
                <CalendarIcon className="w-5 h-5 text-gray-500" />
            </button>
        </div>
    );

    return (
        <>
            <Modal isOpen={!!log} onClose={onClose} title="Edit Sales Log">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DateTimeButton label="Start Date & Time" dateStr={formData.startTime} onClick={() => openPicker('start')} />
                    <DateTimeButton label="End Date & Time" dateStr={formData.endTime} onClick={() => openPicker('end')} />
                    <Input icon={<TShirtIcon className="w-5 h-5 text-gray-400" />} label="Branded Items Sold" type="number" value={formData.brandedItemsSold} onChange={e => setFormData({...formData, brandedItemsSold: Number(e.target.value)})} min="0" required/>
                    <Input icon={<TagIcon className="w-5 h-5 text-gray-400" />} label="Free Size Items Sold" type="number" value={formData.freeSizeItemsSold} onChange={e => setFormData({...formData, freeSizeItemsSold: Number(e.target.value)})} min="0" required/>
                    <Button type="submit" className="w-full">
                        <SaveIcon className="w-5 h-5" /> Save Changes
                    </Button>
                </form>
            </Modal>
             <DateTimePickerModal 
                isOpen={pickerState.isOpen}
                onClose={() => setPickerState({ ...pickerState, isOpen: false })}
                onApply={handlePickerApply}
                initialDate={pickerState.date}
                title={pickerState.title}
            />
        </>
    );
};

const AdminHeader: React.FC<{
    user: User | null;
    onMenuSelect: (page: 'dashboard' | 'users' | 'settings') => void;
    onLogout: () => void;
}> = ({ user, onMenuSelect, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const handleSelect = (page: 'dashboard' | 'users' | 'settings') => {
        onMenuSelect(page);
        setIsMenuOpen(false);
    }
    
    return (
        <header className="p-4 relative z-20">
             <Card className="!py-3">
                <div className="flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-300 rounded-full flex items-center justify-center border-2 border-black/20">
                    <img src="https://sofia.static.domains/Logos/poppy_icon_192x192_transparent.png" alt="Poppy Logo" className="w-16 h-16 object-contain"/>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">{user?.name}</h1>
                            <p className="text-sm text-gray-600">Admin Panel</p>
                        </div>
                    </div>
                    <div className="relative">
                        <Button variant="secondary" onClick={() => setIsMenuOpen(prev => !prev)}>
                            <MenuIcon className="w-5 h-5"/>
                        </Button>
                        {isMenuOpen && (
                            <div 
                                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <a onClick={() => handleSelect('dashboard')} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded-t-lg"><TShirtIcon className="w-5 h-5"/> Dashboard</a>
                                <a onClick={() => handleSelect('users')} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"><ProfileIcon className="w-5 h-5"/> User Management</a>
                                <a onClick={() => handleSelect('settings')} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"><img src="https://sofia.static.domains/Logos/poppy_icon_192x192_transparent.png" alt="Poppy Logo" className="w-5 h-5 object-contain"/> Global Settings</a>
                                <div className="border-t border-gray-200"></div>
                                <a onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer rounded-b-lg"><LogoutIcon className="w-5 h-5"/> Logout</a>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </header>
    );
};

const AdminDashboard: React.FC<{
    allSellers: User[];
    selectedSellerId: string;
    onSellerChange: (id: string) => void;
}> = ({ allSellers, selectedSellerId, onSellerChange}) => {
    const [allLogs, setAllLogs] = useState<SessionLog[]>([]);
    const [targets, setTargets] = useState<BonusTargets | null>(null);
    const [stats, setStats] = useState<WeeklyStatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>({ key: 'startTime', direction: 'descending' });
    const [editingLog, setEditingLog] = useState<SessionLog | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        // Calculate week range and ensure week always starts on Wednesday (UTC)
        let { start: weekStart } = getWeekRange(currentDate);
        // If weekStart is not Wednesday, move to next Wednesday
        if (weekStart.getUTCDay() !== 3) {
            const daysToAdd = (3 - weekStart.getUTCDay() + 7) % 7;
            weekStart.setUTCDate(weekStart.getUTCDate() + daysToAdd);
        }
        const weekStartUTC = new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate(), 0, 0, 0, 0));
        const weekEndUTC = new Date(weekStartUTC);
        weekEndUTC.setUTCDate(weekEndUTC.getUTCDate() + 7);
        function toUTCISOString(date: Date) {
            return date.toISOString().slice(0, 19) + 'Z';
        }
        const params = {
            sellerId: selectedSellerId,
            weekStart: toUTCISOString(weekStartUTC),
            weekEnd: toUTCISOString(weekEndUTC),
        };
        try {
            const result = await storage.getSessionLogsEdge(params);
            if (Array.isArray(result)) {
                setAllLogs([]);
                setStats(null);
                return;
            }
            const logs = result.logs || [];
            const stats = result.stats || null;
            const mappedLogs = logs.map(log => ({
                ...log,
                sellerId: log.seller_id, // Fix: map seller_id to sellerId for filtering
                startTime: log.start_time_manila || log.start_time,
                brandedItemsSold: log.branded_items_sold,
                freeSizeItemsSold: log.free_size_items_sold,
            }));
            setAllLogs(mappedLogs);
            const bonusTargets = await storage.getBonusTargets();
            setTargets(bonusTargets);
            setStats(stats);
        } catch (err) {
            setAllLogs([]);
            setStats(null);
            // Optionally, set an error message state to display to the user
        } finally {
            setIsLoading(false);
        }
    }, [selectedSellerId, currentDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const sellerIds = useMemo(() => new Set(allSellers.map(s => s.id)), [allSellers]);

    const logsToDisplay = useMemo(() => {
        if (selectedSellerId === 'all') {
            return allLogs.filter(log => sellerIds.has(log.sellerId));
        }
        return allLogs.filter(log => log.sellerId === Number(selectedSellerId));
    }, [allLogs, selectedSellerId, sellerIds]);
    
    const requestSort = (key: any) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const sortedLogs = useMemo(() => {
        let sortableLogs = [...logsToDisplay].map(log => ({ ...log, sellerName: allSellers.find(s => s.id === log.sellerId)?.name || 'N/A' }));
        if (sortConfig !== null) {
            sortableLogs.sort((a, b) => {
                let aValue: any;
                let bValue: any;
                if (sortConfig.key === 'total') { aValue = a.brandedItemsSold + a.freeSizeItemsSold; bValue = b.brandedItemsSold + b.freeSizeItemsSold; } 
                else if (sortConfig.key === 'startTime') { aValue = new Date(a.startTime).getTime(); bValue = new Date(b.startTime).getTime(); }
                else if (sortConfig.key === 'sellerName') { aValue = a.sellerName; bValue = b.sellerName; }
                else { aValue = a[sortConfig.key as keyof SessionLog]; bValue = b[sortConfig.key as keyof SessionLog]; }
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableLogs;
    }, [logsToDisplay, sortConfig, allSellers]);

    const rowsPerPage = 10;
    const totalPages = Math.ceil(sortedLogs.length / rowsPerPage);
    const paginatedLogs = sortedLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    if (isLoading) {
        return <div className="p-4 text-center">Loading dashboard...</div>;
    }
    
    if (!stats || !targets) {
        return <div className="p-4 text-center">Could not load dashboard data.</div>;
    }

    return (
        <div className="space-y-6">
            <WeekNavigator currentDate={currentDate} onDateChange={setCurrentDate} />
            <Card>
                <div className="flex items-center gap-2">
                    <label htmlFor="seller-filter" className="font-semibold text-gray-700">Filter by Seller:</label>
                    <select id="seller-filter" value={selectedSellerId} onChange={e => onSellerChange(e.target.value)} className="p-2 rounded-lg border-2 border-gray-300 bg-white/80 focus:border-pink-400 focus:ring-pink-400 focus:outline-none transition">
                        <option value="all">All Sellers</option>
                        {allSellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ProjectedPayoutCard payout={stats.payout} />
                <WeeklyStatCard stats={stats} targets={targets} weekDateRange={`${stats.weekStart} - ${stats.weekEnd}`} />
            </div>
            <div>
                <h2 className="text-xl font-bold mt-6 mb-3">Daily Breakdown</h2>
                <div className="relative">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar" style={{scrollSnapType: 'x mandatory'}}>
                        {stats.dailyStats && Array.isArray(stats.dailyStats)
                            ? stats.dailyStats.map((dayData, index) => <DailyStatCard key={index} dayData={dayData} targets={targets} />)
                            : null}
                    </div>
                </div>
            </div>
             <Card>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CalendarIcon className="w-6 h-6" /> Recent Sales Logs</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b-2 border-gray-200 bg-gray-50/80">
                            <tr>
                                <SortableHeader title="Date" sortKey="startTime" sortConfig={sortConfig} requestSort={requestSort} className="text-left !justify-start pl-2" />
                                {selectedSellerId === 'all' && <SortableHeader title="Seller" sortKey="sellerName" sortConfig={sortConfig} requestSort={requestSort} />}
                                <SortableHeader title="Branded" sortKey="brandedItemsSold" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader title="Free Size" sortKey="freeSizeItemsSold" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader title="Total" sortKey="total" sortConfig={sortConfig} requestSort={requestSort} />
                                <th className="p-2 font-semibold text-gray-600 text-center text-sm">Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLogs.length > 0 ? paginatedLogs.map(log => (
                                <tr key={log.id} className="border-b border-gray-100 last:border-b-0 hover:bg-pink-50/50">
                                    <td className="p-2 text-gray-700 text-sm">{log.startTime ? new Date(log.startTime).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' }) : '—'}</td>
                                    {selectedSellerId === 'all' && <td className="p-2 text-gray-700 text-center text-sm">{log.sellerName}</td>}
                                    <td className="p-2 text-gray-800 text-center text-sm">{log.brandedItemsSold}</td>
                                    <td className="p-2 text-gray-800 text-center text-sm">{log.freeSizeItemsSold}</td>
                                    <td className="p-2 font-bold text-gray-900 text-center text-sm">{log.brandedItemsSold + log.freeSizeItemsSold}</td>
                                    <td className="p-2 text-center">
                                        <button onClick={() => setEditingLog(log)} className="p-1 rounded-full hover:bg-gray-200"><EditIcon className="w-4 h-4 text-gray-600"/></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={selectedSellerId === 'all' ? 6 : 5} className="text-center p-8 text-gray-500">No logs found for this selection.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-200">
                        <Button variant="secondary" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="!py-1 !px-3 text-sm">&larr; Previous</Button>
                        <span className="text-sm font-semibold text-gray-600">Page {currentPage} of {totalPages}</span>
                        <Button variant="secondary" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="!py-1 !px-3 text-sm">Next &rarr;</Button>
                    </div>
                )}
            </Card>
            <EditLogModal log={editingLog} onClose={() => setEditingLog(null)} onSave={fetchData} />
        </div>
    );
};


const AdminView: React.FC = () => {
    const { user, logout } = useAuth();
    const [activePage, setActivePage] = useState<'dashboard' | 'users' | 'settings'>('dashboard');
    const [allSellers, setAllSellers] = useState<User[]>([]);
    const [selectedSellerId, setSelectedSellerId] = useState<string>('all');
    
    useEffect(() => {
        const fetchSellers = async () => {
             const allUsers = await storage.getUsers();
             setAllSellers(allUsers.filter(u => u.role === UserRole.SELLER));
        }
        fetchSellers();
    }, [activePage]); // Refetch if we navigate back to a page that needs it

    const renderContent = () => {
        switch(activePage) {
            case 'dashboard':
                return <AdminDashboard allSellers={allSellers} selectedSellerId={selectedSellerId} onSellerChange={setSelectedSellerId} />;
            case 'users':
                return <UserManagement />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <AdminDashboard allSellers={allSellers} selectedSellerId={selectedSellerId} onSellerChange={setSelectedSellerId} />;
        }
    }

    return (
        <div className="max-w-7xl mx-auto">
            <AdminHeader user={user} onMenuSelect={setActivePage} onLogout={logout} />
            <main className="p-4 pt-6">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminView;
