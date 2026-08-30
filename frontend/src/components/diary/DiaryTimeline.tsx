import React from 'react';
import { DiaryEntry } from '@/lib/diary';
import DiaryEntryCard from './DiaryEntryCard';

interface DiaryTimelineProps {
    entries: DiaryEntry[];
    onEntryClick: (entry: DiaryEntry) => void;
}

const DiaryTimeline: React.FC<DiaryTimelineProps> = ({ entries, onEntryClick }) => {
    if (entries.length === 0) {
        return (
            <div className="text-center py-10 opacity-60">
                <p>No memories yet. Start writing your diary today!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg text-stone-700 mb-4">Your Journey</h3>
            <div className="space-y-3">
                {entries.map((entry) => (
                    <DiaryEntryCard
                        key={entry.id || entry.date}
                        entry={entry}
                        onClick={() => onEntryClick(entry)}
                    />
                ))}
            </div>
        </div>
    );
};

export default DiaryTimeline;
