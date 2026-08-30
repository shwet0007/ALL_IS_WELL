import React from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay } from 'date-fns';
import { DiaryEntry } from '@/lib/diary';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface DiaryCalendarProps {
    entries: DiaryEntry[];
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    className?: string;
}

const DiaryCalendar: React.FC<DiaryCalendarProps> = ({ entries, selectedDate, onDateSelect, className }) => {
    // Extract dates that have entries for highlighting
    const entryDates = entries.map(entry => new Date(entry.date.replace(/-/g, '/')));
    const milestoneDates = entries.filter(e => e.isMilestone).map(entry => new Date(entry.date.replace(/-/g, '/')));

    // Custom modifiers for day picker
    const modifiers = {
        hasEntry: entryDates,
        hasMilestone: milestoneDates,
        today: new Date(),
    };

    const modifiersStyles = {
        hasEntry: {
            fontWeight: 'bold',
            color: 'var(--primary)',
            textDecoration: 'underline decoration-dotted decoration-primary/50'
        },
        hasMilestone: {
            color: '#f59e0b', // amber-500
        }
    };

    return (
        <div className={cn("bg-white rounded-xl shadow-sm border border-stone-100 p-4 w-full md:w-auto animate-fade-in", className)}>
            <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && onDateSelect(date)}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                disabled={{ after: new Date() }} // Disable future dates
                showOutsideDays
                className="mx-auto"
                classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-stone-500 rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "flex-1 text-center text-sm p-0 mb-1 relative [&:has([aria-selected])]:bg-primary/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-stone-100 rounded-full transition-colors",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground !rounded-full",
                    day_today: "bg-stone-100 text-stone-900 rounded-full font-bold",
                    day_outside: "text-stone-300 opacity-50",
                    day_disabled: "text-stone-300 opacity-50 hover:bg-transparent",
                    day_hidden: "invisible",
                }}
                components={{
                    IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                    IconRight: () => <ChevronRight className="h-4 w-4" />,
                }}
                modifiersClassNames={{
                    hasMilestone: "relative after:content-['⭐'] after:absolute after:top-0 after:right-0 after:text-[8px] after:leading-none",
                }}
            />

            <div className="mt-4 pt-4 border-t border-stone-100 text-xs text-center text-stone-500 flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-bold text-primary underline decoration-dotted">12</span>
                    <span>Memory</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-amber-500 font-bold">⭐</span>
                    <span>Milestone</span>
                </div>
            </div>
        </div>
    );
};

export default DiaryCalendar;
