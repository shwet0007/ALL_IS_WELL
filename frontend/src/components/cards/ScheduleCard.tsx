import React from 'react';
import { Clock, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

import { ScheduleItem } from '@/lib/db';

interface ScheduleCardProps {
  items: ScheduleItem[];
  className?: string;
  onToggle?: (id: string) => void;
}

const typeIcons: Record<string, string> = {
  feeding: '🍼',
  sleep: '😴',
  medication: '💊',
  checkup: '🩺',
  other: '❤️',
};

const typeColors: Record<string, string> = {
  feeding: 'border-l-secondary',
  sleep: 'border-l-accent',
  medication: 'border-l-lavender',
  checkup: 'border-l-primary',
  other: 'border-l-pink-300',
};

const ScheduleCard: React.FC<ScheduleCardProps> = ({ items, className, onToggle }) => {
  return (
    <div className={cn("bg-card rounded-2xl shadow-card p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-foreground">Today's Schedule</h3>
        <Clock className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl bg-muted/50 border-l-4 transition-all duration-300 hover:bg-muted animate-slide-up cursor-pointer group",
              typeColors[item.type],
              item.completed && "opacity-60"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => onToggle && onToggle(item.id)}
          >
            <span className="text-xl">{typeIcons[item.type]}</span>

            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-medium text-sm",
                item.completed && "line-through text-muted-foreground"
              )}>
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground">{item.time}</p>
            </div>


            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
              item.completed ? "bg-secondary border-secondary" : "border-muted-foreground/30 group-hover:border-primary"
            )}>
              {item.completed && <Check className="w-4 h-4 text-secondary-foreground" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleCard;
