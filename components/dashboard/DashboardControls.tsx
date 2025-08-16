import React, { useState } from 'react';
import { Card, Button } from '../common/UI';
import { LeftArrowIcon, RightArrowIcon, CalendarIcon } from '../Icons';
import { getWeekRange } from '../../utils/date';
import { DateRangePickerModal } from '../common/DateRangePicker';

interface WeekNavigatorProps {
    currentDate: Date;
    onDateChange: (newDate: Date) => void;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({ currentDate, onDateChange }) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const { start, end } = getWeekRange(currentDate);

    const handlePrevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        onDateChange(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        onDateChange(newDate);
    };
    
    const handleGoToCurrentWeek = () => {
        onDateChange(new Date());
    }

    const handleDateSelect = (startDate: Date, endDate: Date) => {
        onDateChange(startDate); // Just use the start date of the selection
        setIsPickerOpen(false);
    };
    
    const isThisWeek = () => {
        const { start: thisWeekStart } = getWeekRange(new Date());
        return start.getTime() === thisWeekStart.getTime();
    }

    return (
        <>
            <Card className="!p-5 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-100 shadow-[0_4px_24px_0_rgba(180,160,255,0.12)] rounded-2xl border border-pink-100/40">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="font-bold text-xl text-center sm:text-left text-gray-700 whitespace-nowrap tracking-wide drop-shadow-sm">
                        {start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Button variant="secondary" onClick={handlePrevWeek} className="!p-3 !rounded-full shadow-md bg-white/80 hover:bg-pink-100 transition-all border-0" aria-label="Previous Week">
                            <LeftArrowIcon className="w-6 h-6 text-pink-400" />
                        </Button>
                        <Button variant="secondary" onClick={handleGoToCurrentWeek} className="!px-5 !py-3 text-base font-semibold bg-gradient-to-r from-pink-200 via-purple-100 to-blue-100 text-pink-700 shadow-md rounded-full border-0" disabled={isThisWeek()}>
                            This Week
                        </Button>
                        <Button variant="secondary" onClick={handleNextWeek} className="!p-3 !rounded-full shadow-md bg-white/80 hover:bg-pink-100 transition-all border-0" aria-label="Next Week">
                            <RightArrowIcon className="w-6 h-6 text-pink-400" />
                        </Button>
                        <Button variant="secondary" onClick={() => setIsPickerOpen(true)} className="!p-3 !rounded-full shadow-md bg-white/80 hover:bg-blue-100 transition-all border-0" aria-label="Select Week from Calendar">
                            <CalendarIcon className="w-6 h-6 text-purple-400" />
                        </Button>
                    </div>
                </div>
            </Card>
            <DateRangePickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onApply={handleDateSelect}
                initialStartDate={currentDate}
            />
        </>
    );
};