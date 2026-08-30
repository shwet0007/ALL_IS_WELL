import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPIWithContextProps {
    title: string;
    value: string | number;
    trend: string;
    status?: string;
    icon: LucideIcon;
    variant?: 'peach' | 'mint' | 'sky' | 'lavender';
}

const KPIWithContext: React.FC<KPIWithContextProps> = ({
    title,
    value,
    trend,
    status,
    icon: Icon,
    variant = 'sky'
}) => {
    const isPositive = trend.includes('+') || trend.includes('🔥');

    const variants = {
        peach: 'bg-peach-50 text-peach-700 border-peach-100',
        mint: 'bg-mint-50 text-mint-700 border-mint-100',
        sky: 'bg-blue-50 text-blue-700 border-blue-100',
        lavender: 'bg-lavender-50 text-lavender-700 border-lavender-100'
    };

    return (
        <div className={`rounded-2xl p-5 border shadow-soft ${variants[variant]} flex flex-col justify-between h-full`}>
            <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-white/80 rounded-xl">
                    <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trend}
                </div>
            </div>

            <div>
                <p className="text-2xl font-black mb-1">{value}</p>
                <p className="text-sm font-bold opacity-80 uppercase tracking-tight">{title}</p>
            </div>

            {status && (
                <div className="mt-3 pt-3 border-t border-black/5">
                    <p className="text-xs font-medium opacity-70 italic line-clamp-1">
                        Status: {status}
                    </p>
                </div>
            )}
        </div>
    );
};

export default KPIWithContext;
