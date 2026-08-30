import React from 'react';
import { DiaryEntry } from '@/lib/diary';
import { cn } from '@/lib/utils';
import { Calendar, Smile, Meh, Frown, AlertCircle, BatteryMedium } from 'lucide-react';

interface DiaryEntryCardProps {
    entry: DiaryEntry;
    onClick?: () => void;
    className?: string;
}

const moodConfig = {
    'Happy': { icon: Smile, color: 'text-green-500', bg: 'bg-green-100' },
    'Neutral': { icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    'Tired': { icon: BatteryMedium, color: 'text-purple-500', bg: 'bg-purple-100' },
    'Anxious': { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-100' },
    'Unwell': { icon: Frown, color: 'text-red-500', bg: 'bg-red-100' },
};

const DiaryEntryCard: React.FC<DiaryEntryCardProps> = ({ entry, onClick, className }) => {
    const MoodIcon = moodConfig[entry.mood]?.icon || Meh;
    const moodStyle = moodConfig[entry.mood] || moodConfig['Neutral'];

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-white/50 transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer animate-fade-in overflow-hidden",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/50 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100",
                className
            )}
        >
            <div className="relative z-10 flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-xl shadow-inner", moodStyle.bg)}>
                        <MoodIcon className={cn("w-6 h-6", moodStyle.color)} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-stone-800 leading-tight">
                                {new Date(entry.date.replace(/-/g, '/')).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                            {entry.isMilestone && (
                                <span className="bg-amber-100 text-amber-600 p-1 rounded-full border border-amber-200" title="Milestone">
                                    <Smile className="w-3 h-3 fill-amber-500" />
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mt-0.5">{entry.mood}</p>
                    </div>
                </div>
            </div>

            {entry.isMilestone && (
                <div className="relative z-10 mb-4 bg-amber-50/50 border border-amber-100/50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">{entry.milestoneCategory}</span>
                    </div>
                    <h4 className="font-bold text-stone-800 text-sm mb-1">⭐ {entry.milestoneTitle}</h4>
                    {entry.milestoneDescription && (
                        <p className="text-xs text-stone-600 italic">"{entry.milestoneDescription}"</p>
                    )}
                </div>
            )}

            {entry.text && (
                <p className="relative z-10 text-stone-600 text-sm leading-relaxed line-clamp-3 mb-4 font-normal">
                    {entry.text}
                </p>
            )}

            {entry.medicalConditions && entry.medicalConditions.length > 0 && (
                <div className="relative z-10 flex flex-wrap gap-1 mb-3">
                    {entry.medicalConditions.map((condition, index) => (
                        <span key={index} className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] uppercase tracking-wider font-semibold rounded-full border border-red-100">
                            {condition}
                        </span>
                    ))}
                </div>
            )}

            {entry.imageUrls && entry.imageUrls.length > 0 && (
                <div className="relative z-10 flex gap-2 mt-2">
                    {entry.imageUrls.map((url, index) => (
                        <div key={index} className="w-16 h-16 rounded-xl overflow-hidden relative border-2 border-white shadow-sm transition-transform group-hover:rotate-1">
                            <img src={url} alt={`Memory ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DiaryEntryCard;
