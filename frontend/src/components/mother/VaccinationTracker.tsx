import React, { useState, useEffect } from 'react';
import { Syringe, Calendar, Plus, CheckCircle2, Loader2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getVaccineSuggestions } from '@/lib/groq';
import { addScheduleItem, getSchedule, ScheduleItem } from '@/lib/db';
import { format, parseISO, isAfter } from 'date-fns';
import { toast } from 'sonner';

interface VaccineSuggestion {
    vaccine: string;
    dueDate: string;
}

export default function VaccinationTracker() {
    const { currentUser, userProfile } = useAuth();
    const [suggestions, setSuggestions] = useState<VaccineSuggestion[]>([]);
    const [existingSchedule, setExistingSchedule] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState<string | null>(null);

    const fetchData = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const [aiSuggestions, schedule] = await Promise.all([
                getVaccineSuggestions(userProfile),
                getSchedule(currentUser.uid)
            ]);
            setSuggestions(aiSuggestions);
            setExistingSchedule(schedule);
        } catch (error) {
            console.error("Error fetching vaccination data:", error);
            toast.error("Failed to load vaccine schedule");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentUser, userProfile]);

    const handleAddToSchedule = async (vaccine: VaccineSuggestion) => {
        if (!currentUser) return;
        setAdding(vaccine.vaccine);
        try {
            const formattedDate = format(parseISO(vaccine.dueDate), 'MMM dd, yyyy');
            await addScheduleItem(currentUser.uid, {
                title: `Vaccine: ${vaccine.vaccine} (${formattedDate})`,
                time: "09:00",
                type: 'vaccination',
                completed: false,
                date: vaccine.dueDate,
                note: `Due on ${formattedDate}`
            });
            toast.success(`${vaccine.vaccine} added to your schedule!`);
            fetchData(); // Refresh to show checkmark
        } catch (error) {
            console.error("Error adding to schedule:", error);
            toast.error("Failed to add to schedule");
        } finally {
            setAdding(null);
        }
    };

    const isAlreadyScheduled = (vaccineName: string) => {
        return existingSchedule.some(item =>
            item.title.toLowerCase().includes(vaccineName.toLowerCase())
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">AI is generating your baby's vaccination schedule...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                    <p className="text-sm text-blue-900 font-medium">AI-Driven Immunization Schedule</p>
                    <p className="text-[11px] text-blue-800/80">
                        Based on your baby's age, our AI has identified these essential vaccinations. You can add them to your calendar to receive reminders.
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {suggestions.map((v, idx) => {
                    const scheduled = isAlreadyScheduled(v.vaccine);
                    const isPast = !scheduled && isAfter(new Date(), parseISO(v.dueDate));

                    return (
                        <div
                            key={idx}
                            className={cn(
                                "group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                                scheduled
                                    ? "bg-green-50 border-green-100"
                                    : isPast
                                        ? "bg-red-50 border-red-100"
                                        : "bg-white border-border hover:shadow-md hover:border-primary/20"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                    scheduled ? "bg-green-100 text-green-600" : isPast ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
                                )}>
                                    <Syringe className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-foreground">{v.vaccine}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                        <p className={cn(
                                            "text-xs font-medium",
                                            isPast ? "text-red-600" : "text-muted-foreground"
                                        )}>
                                            Due: {format(parseISO(v.dueDate), 'MMM dd, yyyy')}
                                            {isPast && " (Overdue)"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {scheduled ? (
                                <div className="flex items-center gap-1.5 text-green-600 font-bold text-[10px] bg-white px-3 py-1 rounded-full border border-green-100 shadow-sm">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    SCHEDULED
                                </div>
                            ) : (
                                <Button
                                    size="sm"
                                    variant={isPast ? "destructive" : "outline"}
                                    className="rounded-xl h-8 text-[11px] font-bold"
                                    onClick={() => handleAddToSchedule(v)}
                                    disabled={adding === v.vaccine}
                                >
                                    {adding === v.vaccine ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                    ) : (
                                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                                    )}
                                    Add to Calendar
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="p-4 bg-muted/30 rounded-2xl border border-dashed border-border flex gap-3 items-start">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    This schedule is based on the Universal Immunization Programme (UIP) in India. However, individual needs may vary. Please consult your pediatrician for a finalized clinical schedule.
                </p>
            </div>
        </div>
    );
}

// Helper for conditional classes if cn isn't available in scope
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
