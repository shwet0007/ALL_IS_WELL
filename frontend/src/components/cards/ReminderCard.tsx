import { Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Reminder {
  id: string;
  title: string;
  description: string;
  type: 'vaccination' | 'checkup' | 'milestone' | 'medication';
  date: string;
  babyMessage?: string;
  time: string; // Added time for auto-expiry logic
}

interface ReminderCardProps {
  reminders: Reminder[];
  title?: string;
  className?: string;
  onDismiss?: (id: string) => void;
  onCardClick?: (id: string) => void;
}

const typeColors = {
  vaccination: 'bg-secondary text-secondary-foreground',
  checkup: 'bg-primary text-primary-foreground',
  milestone: 'bg-accent text-accent-foreground',
  medication: 'bg-lavender text-lavender-foreground',
};

const typeLabels = {
  vaccination: '💉 Vaccination',
  checkup: '🩺 Checkup',
  milestone: '🎯 Milestone',
  medication: '💊 Medication',
};

const ReminderCard: React.FC<ReminderCardProps> = ({ reminders, title = "Upcoming Reminders", className, onDismiss, onCardClick }) => {
  return (
    <div className={cn("bg-card rounded-2xl shadow-card p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-foreground">{title}</h3>
        <Bell className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="space-y-3">
        {reminders.map((reminder, index) => (
          <div
            key={reminder.id}
            className={cn(
              "w-full relative flex flex-col items-start gap-1 p-4 rounded-xl transition-all duration-300 animate-slide-up border border-transparent group overflow-hidden",
              typeColors[reminder.type]
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Explicit Dismissal Button (X) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss?.(reminder.id);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/5 hover:bg-black/10 transition-colors z-20"
              title="Dismiss reminder"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div
              className="w-full text-left cursor-pointer"
              onClick={() => onCardClick?.(reminder.id)}
            >
              <div className="w-full flex justify-between items-start mb-1 pr-6">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  {typeLabels[reminder.type]}
                </span>
                <span className="text-[10px] font-bold opacity-80">{reminder.date}</span>
              </div>

              <h4 className="font-bold text-sm leading-tight mb-1">{reminder.title}</h4>

              {reminder.babyMessage && (
                <div className="mt-1 w-full">
                  <p className="text-xs italic text-pink-600 font-medium leading-relaxed">
                    "{reminder.babyMessage}"
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReminderCard;
