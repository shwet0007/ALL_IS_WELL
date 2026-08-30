import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  variant: 'peach' | 'mint' | 'sky' | 'lavender';
  onClick?: () => void;
  className?: string;
}

const variantStyles = {
  peach: 'card-peach text-primary-foreground',
  mint: 'card-mint text-secondary-foreground',
  sky: 'card-sky text-accent-foreground',
  lavender: 'bg-lavender text-lavender-foreground rounded-2xl shadow-soft',
};

const iconBgStyles = {
  peach: 'bg-primary-dark/30',
  mint: 'bg-secondary-dark/30',
  sky: 'bg-accent-dark/30',
  lavender: 'bg-lavender-foreground/10',
};

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon: Icon,
  label,
  description,
  variant,
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-4 text-left transition-all duration-300 hover:scale-105 hover:shadow-card animate-slide-up",
        variantStyles[variant],
        className
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
        iconBgStyles[variant]
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-semibold text-sm mb-1">{label}</h4>
      {description && (
        <p className="text-xs opacity-70 line-clamp-2">{description}</p>
      )}
    </button>
  );
};

export default QuickActionCard;
