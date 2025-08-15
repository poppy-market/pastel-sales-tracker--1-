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
            <Card className="!p-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="font-bold text-lg text-center sm:text-left text-gray-700 whitespace-nowrap">
                        {start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="secondary" onClick={handlePrevWeek} className="!p-2" aria-label="Previous Week">
                            <LeftArrowIcon className="w-5 h-5" />
                        </Button>
                         <Button variant="secondary" onClick={handleGoToCurrentWeek} className="!px-3 !py-2 text-sm" disabled={isThisWeek()}>
                            This Week
                        </Button>
                        <Button variant="secondary" onClick={handleNextWeek} className="!p-2" aria-label="Next Week">
                            <RightArrowIcon className="w-5 h-5" />
                        </Button>
                        <Button variant="secondary" onClick={() => setIsPickerOpen(true)} className="!p-2" aria-label="Select Week from Calendar">
                            <CalendarIcon className="w-5 h-5" />
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