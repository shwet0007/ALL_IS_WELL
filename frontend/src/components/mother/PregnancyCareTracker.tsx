import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getPregnancyCheckupSuggestions } from '@/lib/groq';
import { addScheduleItem, getSchedule, ScheduleItem } from '@/lib/db';
import { format, parseISO, isAfter } from 'date-fns';
import { toast } from 'sonner';
import { Stethoscope, Calendar, CheckCircle2, AlertCircle, Loader2, Plus } from 'lucide-react';

interface CheckupSuggestion {
    checkup: string;
    dueDate: string;
}

export default function PregnancyCareTracker() {
    const { currentUser, userProfile } = useAuth();
    const [suggestions, setSuggestions] = useState<CheckupSuggestion[]>([]);
    const [existingSchedule, setExistingSchedule] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState<string | null>(null);

    const fetchData = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const [aiSuggestions, schedule] = await Promise.all([
                getPregnancyCheckupSuggestions(userProfile),
                getSchedule(currentUser.uid)
            ]);
            setSuggestions(aiSuggestions);
            setExistingSchedule(schedule);
        } catch (error) {
            console.error("Error fetching pregnancy data:", error);
            toast.error("Failed to load checkup schedule");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentUser, userProfile]);

    const isAlreadyScheduled = (checkupName: string) => {
        return existingSchedule.some(item => item.title.includes(checkupName));
    };

    const handleAddToSchedule = async (suggestion: CheckupSuggestion) => {
        if (!currentUser) return;
        setAdding(suggestion.checkup);
        try {
            const formattedDate = format(parseISO(suggestion.dueDate), 'MMM dd, yyyy');
            await addScheduleItem(currentUser.uid, {
                title: `Checkup: ${suggestion.checkup} (${formattedDate})`,
                time: "10:00",
                type: 'checkup',
                completed: false,
                date: suggestion.dueDate,
                note: `AI Suggested ANC Checkup: ${suggestion.checkup}`
            });
            toast.success(`${suggestion.checkup} added to your schedule!`);
            fetchData(); // Refresh to show checkmark
        } catch (error) {
            console.error("Error adding to schedule:", error);
            toast.error("Failed to add to schedule");
        } finally {
            setAdding(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Generating your personalized pregnancy schedule...</p>
            </div>
        );
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-primary" />
                    Recommended Antenatal Care
                </CardTitle>
                <CardDescription>
                    AI Suggested checkups based on your pregnancy start date
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
                {suggestions.map((item, index) => {
                    const scheduled = isAlreadyScheduled(item.checkup);
                    const dueDate = parseISO(item.dueDate);
                    const isOverdue = !scheduled && !isAfter(dueDate, new Date());

                    return (
                        <div
                            key={index}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-white border border-border/50 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="space-y-1 mb-3 sm:mb-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-foreground">{item.checkup}</h4>
                                    {scheduled && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Scheduled
                                        </span>
                                    )}
                                    {isOverdue && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">
                                            <AlertCircle className="w-3 h-3" />
                                            Action Needed
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider font-medium">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Due: {format(dueDate, 'MMMM d, yyyy')}
                                </p>
                            </div>

                            <Button
                                size="sm"
                                variant={scheduled ? "outline" : "default"}
                                disabled={scheduled || adding === item.checkup}
                                onClick={() => handleAddToSchedule(item)}
                                className="w-full sm:w-auto rounded-xl"
                            >
                                {adding === item.checkup ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : scheduled ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        In Calendar
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add to Schedule
                                    </>
                                )}
                            </Button>
                        </div>
                    );
                })}

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mt-6 translate-y-2">
                    <p className="text-xs text-primary/70 leading-relaxed italic">
                        * This schedule is AI-generated for general awareness. Please follow the specific plan prescribed by your Obstetrician/Gynecologist for your clinical needs.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
