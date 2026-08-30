import React from 'react';

interface ConsistencyScoreProps {
    score: number;
    label: string;
}

const ConsistencyScore: React.FC<ConsistencyScoreProps> = ({ score, label }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-soft flex flex-col items-center justify-center space-y-4 border border-primary/5">
            <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-100"
                    />
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="text-primary transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{score}%</span>
                </div>
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overall Care Consistency</p>
                <p className={`text-lg font-bold ${score > 80 ? 'text-green-600' : score > 60 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {label}
                </p>
            </div>
        </div>
    );
};

export default ConsistencyScore;
