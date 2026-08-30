import React from 'react';
import { Baby, Heart, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusCardProps {
  type: 'pregnant' | 'baby';
  weekOrAge: number;
  dueDate?: string;
  babyName?: string;
  className?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({
  type,
  weekOrAge,
  dueDate,
  babyName,
  className,
}) => {
  return (
    <div
      className={cn(
        "card-peach p-5 animate-fade-in",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {type === 'pregnant' ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground/80">
                  Pregnancy Journey
                </span>
              </div>
              <h3 className="text-2xl font-bold text-primary-foreground mb-1">
                Week {weekOrAge}
              </h3>
              <p className="text-sm text-primary-foreground/70">
                {dueDate && `Due: ${dueDate}`}
              </p>
              <div className="mt-4">
                <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-foreground/60 rounded-full transition-all duration-500"
                    style={{ width: `${(weekOrAge / 40) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-primary-foreground/60 mt-1">
                  {40 - weekOrAge} weeks to go
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Baby className="w-5 h-5 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground/80">
                  {babyName || 'Your Baby'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-primary-foreground mb-1">
                {weekOrAge} {weekOrAge === 1 ? 'Month' : 'Months'} Old
              </h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-primary-foreground/70">
                <Calendar className="w-4 h-4" />
                <span>Next checkup in 5 days</span>
              </div>
            </>
          )}
        </div>

        <div className="w-16 h-16 rounded-full bg-card/30 flex items-center justify-center animate-float">
          {type === 'pregnant' ? (
            <span className="text-3xl">🤰</span>
          ) : (
            <span className="text-3xl">👶</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
