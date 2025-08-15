import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button } from './UI';
import { LeftArrowIcon, RightArrowIcon } from '../Icons';

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface CalendarProps {
    viewDate: Date;
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ viewDate, selectedDate, onDateSelect }) => {
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
            
            const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
            const isToday = date.getTime() === today.getTime();

            let buttonClasses = "w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-200 text-sm";
            
            if (isSelected) {
                buttonClasses += " bg-pink-400 text-white font-bold";
            } else {
                 buttonClasses += " hover:bg-gray-200";
            }
            
            if(isToday && !isSelected) {
                buttonClasses += " border-2 border-pink-400"
            }
            
            dayElements.push(
               <div key={day} className="flex justify-center items-center">
                   <button onClick={() => onDateSelect(date)} className={buttonClasses}>
                       {day}
                   </button>
                </div>
            );
        }
        return dayElements;
    }, [year, month, daysInMonth, firstDay, selectedDate, onDateSelect, today]);

    return (
        <div className="grid grid-cols-7 gap-y-1 items-center text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="font-bold text-gray-500 text-xs w-10">{day}</div>)}
            {calendarDays}
        </div>
    );
};

interface DateTimePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (date: Date) => void;
    initialDate: Date;
    title: string;
}

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({ isOpen, onClose, onApply, initialDate, title }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [hour, setHour] = useState(12); // 1-12
    const [minute, setMinute] = useState(0); // 0-59
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

    useEffect(() => {
        if (isOpen) {
            const initDate = new Date(initialDate);
            const dateOnly = new Date(initDate.getFullYear(), initDate.getMonth(), initDate.getDate());
            setViewDate(dateOnly);
            setSelectedDate(dateOnly);

            const h24 = initDate.getHours();
            const min = initDate.getMinutes();

            const newPeriod = h24 >= 12 ? 'PM' : 'AM';
            let newHour = h24 % 12;
            if (newHour === 0) { // For 12am and 12pm
                newHour = 12;
            }
            
            setHour(newHour);
            setMinute(min);
            setPeriod(newPeriod);
        }
    }, [isOpen, initialDate]);

    const handleApply = () => {
        const newDate = new Date(selectedDate);
        
        let h24 = hour;
        if (period === 'PM' && h24 < 12) {
            h24 += 12;
        }
        if (period === 'AM' && h24 === 12) { // Midnight case
            h24 = 0;
        }

        newDate.setHours(h24, minute);
        onApply(newDate);
    };

    const handlePrevMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'hour') {
            setHour(Number(value));
        } else if (name === 'minute') {
            setMinute(Number(value));
        } else if (name === 'period') {
            setPeriod(value as 'AM' | 'PM');
        }
    };

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const periods: ('AM' | 'PM')[] = ['AM', 'PM'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div className="flex justify-between items-center p-2 rounded-lg bg-white">
                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200" aria-label="Previous month"><LeftArrowIcon className="w-5 h-5" /></button>
                    <div className="font-bold text-lg">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</div>
                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200" aria-label="Next month"><RightArrowIcon className="w-5 h-5" /></button>
                </div>
                
                <Calendar
                    viewDate={viewDate}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                />
                
                <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200">
                    <label htmlFor="hour-select" className="sr-only">Hour</label>
                    <select id="hour-select" name="hour" value={hour} onChange={handleTimeChange} className="p-2 rounded-md border-2 border-gray-300 bg-white text-center">
                        {hours.map(h => <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>)}
                    </select>
                    <span className="font-bold text-lg" aria-hidden="true">:</span>
                     <label htmlFor="minute-select" className="sr-only">Minute</label>
                    <select id="minute-select" name="minute" value={minute.toString().padStart(2,'0')} onChange={handleTimeChange} className="p-2 rounded-md border-2 border-gray-300 bg-white text-center">
                        {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <label htmlFor="period-select" className="sr-only">Period</label>
                    <select id="period-select" name="period" value={period} onChange={handleTimeChange} className="p-2 rounded-md border-2 border-gray-300 bg-white">
                        {periods.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                <div className="flex gap-2 justify-end pt-4 mt-2 border-t border-gray-200">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleApply}>Apply</Button>
                </div>
            </div>
        </Modal>
    );
};
