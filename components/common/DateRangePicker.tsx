
import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button } from './UI';
import { LeftArrowIcon, RightArrowIcon } from '../Icons';

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface CalendarProps {
    viewDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    onDateSelect: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ viewDate, startDate, endDate, onDateSelect }) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calendarDays = useMemo(() => {
        const dayElements = [];
        for (let i = 0; i < firstDay; i++) {
            dayElements.push(<div key={`empty-start-${i}`} className="w-10 h-10"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            
            const isSelectedStart = startDate && date.getTime() === startDate.getTime();
            const isSelectedEnd = endDate && date.getTime() === endDate.getTime();
            const isInRange = startDate && endDate && date > startDate && date < endDate;
            const isToday = date.getTime() === today.getTime();

            let buttonClasses = "w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-200 text-sm";
            let cellClasses = "flex justify-center items-center";

            if (isSelectedStart || isSelectedEnd) {
                buttonClasses += " bg-pink-400 text-white font-bold";
                if(isSelectedStart && endDate) cellClasses += " bg-pink-200 rounded-l-full";
                if(isSelectedEnd) cellClasses += " bg-pink-200 rounded-r-full";
            } else if (isInRange) {
                buttonClasses += " bg-pink-200 rounded-none text-pink-900";
                cellClasses += " bg-pink-200";
            } else {
                 buttonClasses += " hover:bg-gray-200";
            }
            
            if(isToday && !isSelectedStart && !isSelectedEnd && !isInRange) {
                buttonClasses += " border-2 border-pink-400"
            }
            
            dayElements.push(
               <div key={day} className={cellClasses}>
                   <button onClick={() => onDateSelect(date)} className={buttonClasses}>
                       {day}
                   </button>
                </div>
            );
        }
        return dayElements;
    }, [year, month, daysInMonth, firstDay, startDate, endDate, onDateSelect, today]);

    return (
        <div className="grid grid-cols-7 gap-y-1 items-center text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="font-bold text-gray-500 text-xs w-10">{day}</div>)}
            {calendarDays}
        </div>
    );
};


interface DateRangePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (start: Date, end: Date) => void;
    initialStartDate?: Date;
    initialEndDate?: Date;
}

export const DateRangePickerModal: React.FC<DateRangePickerModalProps> = ({ isOpen, onClose, onApply, initialStartDate, initialEndDate }) => {
    const [viewDate, setViewDate] = useState(initialStartDate || new Date());
    const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
    const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);

    useEffect(() => {
        if(isOpen) {
            const initialStart = initialStartDate ? new Date(initialStartDate) : null;
            if(initialStart) initialStart.setHours(0,0,0,0);
            
            const initialEnd = initialEndDate ? new Date(initialEndDate) : null;
            if(initialEnd) initialEnd.setHours(0,0,0,0);

            setStartDate(initialStart);
            setEndDate(initialEnd);
            setViewDate(initialStart || new Date());
        }
    }, [isOpen, initialStartDate, initialEndDate]);

    const handleDateSelect = (date: Date) => {
        if (!startDate || (startDate && endDate)) {
            setStartDate(date);
            setEndDate(null);
        } else if (date < startDate) {
            setEndDate(startDate);
            setStartDate(date);
        } else {
            setEndDate(date);
        }
    };
    
    const handleApply = () => {
        if (startDate && endDate) {
            onApply(startDate, endDate);
            onClose();
        } else if (startDate && !endDate) {
            // If only start date is selected, treat it as a single-day range
            onApply(startDate, startDate);
            onClose();
        }
    };

    const handlePrevMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleClear = () => {
        setStartDate(null);
        setEndDate(null);
    }
    
    const formattedStartDate = startDate ? startDate.toLocaleDateString('en-CA') : 'Select Start';
    const formattedEndDate = endDate ? endDate.toLocaleDateString('en-CA') : 'Select End';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Select Date Range">
            <div className="space-y-4">
                <div className="flex justify-between items-center p-2 rounded-lg bg-white">
                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200" aria-label="Previous month"><LeftArrowIcon className="w-5 h-5" /></button>
                    <div className="font-bold text-lg">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</div>
                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200" aria-label="Next month"><RightArrowIcon className="w-5 h-5" /></button>
                </div>
                
                <Calendar
                    viewDate={viewDate}
                    startDate={startDate}
                    endDate={endDate}
                    onDateSelect={handleDateSelect}
                />
                
                <div className="flex justify-between items-center text-sm font-semibold p-2 bg-gray-100 rounded-lg mt-2">
                    <span className="text-gray-700">{formattedStartDate}</span>
                    <span className="text-gray-500">-</span>
                    <span className="text-gray-700">{formattedEndDate}</span>
                </div>

                <div className="flex gap-2 justify-end pt-4 mt-2 border-t border-gray-200">
                    <Button variant="secondary" onClick={handleClear}>Clear</Button>
                    <Button variant="primary" onClick={handleApply} disabled={!startDate}>Apply</Button>
                </div>
            </div>
        </Modal>
    );
};
