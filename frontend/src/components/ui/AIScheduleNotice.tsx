import React, { useState } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface AIScheduleNoticeProps {
    className?: string;
}

const AIScheduleNotice: React.FC<AIScheduleNoticeProps> = ({ className }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className={cn(
            "bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mb-4 flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-1",
            className
        )}>
            <div className="bg-amber-100 p-2 rounded-full hidden sm:block">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600 sm:hidden" />
                    <h4 className="text-sm font-semibold text-amber-800">
                        AI-generated guidance only
                    </h4>
                </div>
                <p className="text-xs sm:text-sm text-amber-700 leading-relaxed">
                    Please consult your doctor before following this schedule.
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1 ml-1 cursor-help underline decoration-dotted text-amber-800 font-medium">
                                    <Info className="w-3 h-3" />
                                    Read more
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-xs bg-white text-popover-foreground shadow-md border-amber-100 p-3">
                                <p className="text-xs">
                                    This schedule is generated using AI based on your entered details.
                                    It is not mandatory to follow it exactly and should not replace professional medical advice.
                                    Always consult your doctor.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </p>
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="text-amber-500 hover:text-amber-700 hover:bg-amber-100/50 p-1 rounded-full transition-colors"
                aria-label="Dismiss notice"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default AIScheduleNotice;
