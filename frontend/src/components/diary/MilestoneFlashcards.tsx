import React from 'react';
import { DiaryEntry } from '@/lib/diary';
import { cn } from '@/lib/utils';
import { Star, Trophy, Target, Heart } from 'lucide-react';

interface MilestoneFlashcardsProps {
    entries: DiaryEntry[];
}

const categoryStyles: Record<string, { bg: string, text: string, decoration: string, icon: any }> = {
    "Infant Milestones": {
        bg: "bg-gradient-to-br from-sky-400 to-blue-600",
        text: "text-white",
        decoration: "bg-white/20",
        icon: Trophy
    },
    "Pregnancy Milestones": {
        bg: "bg-gradient-to-br from-pink-400 to-rose-600",
        text: "text-white",
        decoration: "bg-white/20",
        icon: Heart
    },
    "Personal Moments": {
        bg: "bg-gradient-to-br from-amber-400 to-orange-600",
        text: "text-white",
        decoration: "bg-white/20",
        icon: Star
    },
    "default": {
        bg: "bg-gradient-to-br from-purple-400 to-indigo-600",
        text: "text-white",
        decoration: "bg-white/20",
        icon: Target
    }
};

const MilestoneFlashcards: React.FC<MilestoneFlashcardsProps> = ({ entries }) => {
    const milestones = entries.filter(e => e.isMilestone);

    if (milestones.length === 0) return null;

    return (
        <div className="space-y-6 pt-8 border-t border-stone-100">
            <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-bold text-stone-800 tracking-tight">Milestone Collection</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {milestones.map((entry) => {
                    const style = categoryStyles[entry.milestoneCategory || ""] || categoryStyles["default"];
                    const Icon = style.icon;
                    const date = new Date(entry.date.replace(/-/g, '/'));

                    return (
                        <div
                            key={entry.id || entry.date}
                            className={cn(
                                "group relative overflow-hidden rounded-3xl p-6 shadow-xl transition-all hover:scale-[1.03] hover:shadow-2xl cursor-default",
                                style.bg,
                                style.text
                            )}
                        >
                            {/* Decorative elements */}
                            <div className={cn("absolute -top-6 -right-6 w-24 h-24 rounded-full", style.decoration)} />
                            <div className={cn("absolute -bottom-10 -left-10 w-32 h-32 rounded-full", style.decoration)} />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-black/10 px-2 py-1 rounded-full backdrop-blur-sm">
                                        {entry.milestoneCategory}
                                    </span>
                                </div>

                                <div className="flex-grow">
                                    <h4 className="text-xl font-black mb-2 leading-tight drop-shadow-sm">
                                        {entry.milestoneTitle}
                                    </h4>
                                    {entry.milestoneDescription && (
                                        <p className="text-sm opacity-90 line-clamp-2 font-medium">
                                            {entry.milestoneDescription}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold opacity-70 tracking-tighter">Achievement Unlocked</span>
                                        <span className="text-sm font-bold tracking-tight">
                                            {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="bg-white text-stone-900 w-8 h-8 rounded-full flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MilestoneFlashcards;
