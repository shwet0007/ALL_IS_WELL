import React, { useMemo } from 'react';
import { format, addWeeks, addMonths, isPast, isToday, differenceInDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Syringe, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { UserProfile } from '@/lib/db';
import { useNavigate } from 'react-router-dom';

interface VaccinationScheduleProps {
    userProfile: UserProfile;
}

interface Vaccine {
    id: string;
    name: string;
    ageLabel: string;
    ageWeeks: number; // For calculation
    description?: string;
}

const VACCINES: Vaccine[] = [
    { id: 'birth-1', name: 'BCG', ageLabel: 'At Birth', ageWeeks: 0, description: 'Tuberculosis' },
    { id: 'birth-2', name: 'Hepatitis B (1)', ageLabel: 'At Birth', ageWeeks: 0, description: 'Hepatitis B' },
    { id: 'birth-3', name: 'OPV (0)', ageLabel: 'At Birth', ageWeeks: 0, description: 'Polio' },

    { id: '6w-1', name: 'DPT (1)', ageLabel: '6 Weeks', ageWeeks: 6, description: 'Diphtheria, Pertussis, Tetanus' },
    { id: '6w-2', name: 'IPV (1)', ageLabel: '6 Weeks', ageWeeks: 6, description: 'Polio' },
    { id: '6w-3', name: 'Hepatitis B (2)', ageLabel: '6 Weeks', ageWeeks: 6, description: 'Hepatitis B' },
    { id: '6w-4', name: 'Hib (1)', ageLabel: '6 Weeks', ageWeeks: 6, description: 'Meningitis, Pneumonia' },
    { id: '6w-5', name: 'Rotavirus (1)', ageLabel: '6 Weeks', ageWeeks: 6, description: 'Diarrhea' },

    { id: '10w-1', name: 'DPT (2)', ageLabel: '10 Weeks', ageWeeks: 10, description: 'DDT Booster' },
    { id: '10w-2', name: 'IPV (2)', ageLabel: '10 Weeks', ageWeeks: 10, description: 'Polio' },
    { id: '10w-3', name: 'Hib (2)', ageLabel: '10 Weeks', ageWeeks: 10, description: 'Hib Booster' },
    { id: '10w-4', name: 'Rotavirus (2)', ageLabel: '10 Weeks', ageWeeks: 10, description: 'Rotavirus Booster' },

    { id: '14w-1', name: 'DPT (3)', ageLabel: '14 Weeks', ageWeeks: 14, description: 'DDT Booster' },
    { id: '14w-2', name: 'IPV (3)', ageLabel: '14 Weeks', ageWeeks: 14, description: 'Polio' },
    { id: '14w-3', name: 'Hib (3)', ageLabel: '14 Weeks', ageWeeks: 14, description: 'Hib Booster' },
    { id: '14w-4', name: 'Rotavirus (3)', ageLabel: '14 Weeks', ageWeeks: 14, description: 'Rotavirus Booster' },
    { id: '14w-5', name: 'Hepatitis B (3)', ageLabel: '14 Weeks', ageWeeks: 14, description: 'Hepatitis B Booster' },

    { id: '9m-1', name: 'MMR (1)', ageLabel: '9 Months', ageWeeks: 39, description: 'Measles, Mumps, Rubella' }, // approx 39 weeks
];

const VaccinationSchedule: React.FC<VaccinationScheduleProps> = ({ userProfile }) => {
    const navigate = useNavigate();
    const babyDob = userProfile.babyDob;

    const schedule = useMemo(() => {
        if (!babyDob) return [];
        const dob = new Date(babyDob);

        return VACCINES.map(vaccine => {
            const dueDate = addWeeks(dob, vaccine.ageWeeks);
            let status: 'completed' | 'due' | 'upcoming' | 'overdue' = 'upcoming';

            if (isToday(dueDate)) {
                status = 'due';
            } else if (isPast(dueDate)) {
                // Simple logic: if more than 2 weeks past due, mark overdue? 
                // Alternatively, user wanted "View Only" simply based on dates.
                // If it's in the past, effectively it's 'overdue' or 'due' if we don't have records.
                // Since this is view only, let's mark it as 'overdue' if > 2 weeks past, else 'due'.
                const daysPast = differenceInDays(new Date(), dueDate);
                if (daysPast > 14) {
                    status = 'overdue';
                } else {
                    status = 'due'; // Recently passed
                }
            } else {
                status = 'upcoming';
            }

            return { ...vaccine, dueDate, status };
        });
    }, [babyDob]);

    if (!babyDob) {
        return (
            <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <Syringe className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Vaccination Schedule</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto mb-4">
                            Please update your baby's Date of Birth in your profile to see the personalized vaccination schedule.
                        </p>
                        <Button onClick={() => navigate('/profile')}>
                            Update Profile
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-full">
                    <Syringe className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Vaccination Schedule</h2>
                    <p className="text-muted-foreground">Standard immunization timeline for your baby</p>
                </div>
            </div>

            <div className="grid gap-4">
                {schedule.map((item) => (
                    <Card key={item.id} className={`border-l-4 overflow-hidden transition-all hover:shadow-md ${item.status === 'overdue' ? 'border-l-red-500' :
                        item.status === 'due' ? 'border-l-amber-500' :
                            'border-l-blue-500' // upcoming
                        }`}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-lg">{item.name}</h4>
                                    <Badge variant={
                                        item.status === 'overdue' ? 'destructive' :
                                            item.status === 'due' ? 'default' : // 'default' usually primary color
                                                'outline'
                                    } className={
                                        item.status === 'due' ? 'bg-amber-500 hover:bg-amber-600' : ''
                                    }>
                                        {item.status === 'due' ? 'Ready for a quick check? 🧸' :
                                            item.status === 'overdue' ? "A little behind—no worries, let's catch up 🕊️" :
                                                'Coming up soon'}
                                    </Badge>
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Due: {format(item.dueDate, 'MMM d, yyyy')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Age: {item.ageLabel}
                                    </span>
                                </div>
                                {item.description && (
                                    <p className="text-xs text-muted-foreground mt-1 ml-1 cursor-help" title="Protects against">
                                        Projected: {item.description}
                                    </p>
                                )}
                                {item.status === 'upcoming' && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Countdown: {differenceInDays(item.dueDate, new Date())} days away
                                        </span>
                                        <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100 uppercase">
                                            You're doing an amazing job! 🌟
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Visual Indicator of timeline position */}
                            <div className="flex flex-col items-center pl-4 border-l border-gray-100">
                                <div className={`text-2xl font-bold ${item.status === 'overdue' ? 'text-red-500' :
                                    item.status === 'due' ? 'text-amber-500' :
                                        'text-blue-500'
                                    }`}>
                                    {format(item.dueDate, 'd')}
                                </div>
                                <div className="text-xs uppercase font-bold text-muted-foreground">
                                    {format(item.dueDate, 'MMM')}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <p className="text-xs text-center text-muted-foreground mt-8">
                * This schedule is a general guideline. Always consult your pediatrician for the exact schedule.
            </p>
        </div>
    );
};

export default VaccinationSchedule;
