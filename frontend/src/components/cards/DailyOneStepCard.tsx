import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Flame, Loader2 } from 'lucide-react'; // Import Flame for streak
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DailyTask {
    _id: string;
    task: string;
    status: 'pending' | 'completed' | 'skipped';
    note?: string;
}

export const DailyOneStepCard: React.FC = () => {
    const [task, setTask] = useState<DailyTask | null>(null);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchDailyTask();
    }, []);

    const fetchDailyTask = async () => {
        try {
            const data = await api.get('/users/daily-task');
            setTask(data.task);
            setStreak(data.streak);
        } catch (error) {
            console.error("Failed to fetch daily task:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status: 'completed' | 'skipped') => {
        if (!task) return;
        setUpdating(true);
        try {
            const data = await api.patch(`/users/daily-task/${task._id}`, { status });
            setTask(data.task);
            if (status === 'completed') {
                setStreak(prev => prev + 1);
                toast.success("Great job! Step completed.");
            } else {
                toast.info("Task skipped. See you tomorrow!");
            }
        } catch (error) {
            console.error("Failed to update task:", error);
            toast.error("Failed to update task status.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <Card className="animate-pulse bg-muted/20 border-border/50">
                <CardContent className="h-32 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (!task) return null;

    const isPending = task.status === 'pending';

    return (
        <Card className={cn(
            "border-2 transition-all duration-500 overflow-hidden relative",
            task.status === 'completed' ? "bg-green-50 border-green-200" :
                task.status === 'skipped' ? "bg-gray-50 border-gray-200 opacity-80" :
                    "bg-gradient-to-r from-violet-50 to-fuchsia-50 border-violet-100"
        )}>
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Flame className={cn("w-24 h-24", task.status === 'completed' ? "text-green-500" : "text-violet-500")} />
            </div>

            <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                        🌟 Daily 1 Step Ahead
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Small steps for big changes.</p>
                </div>

                {/* Streak Counter */}
                <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1 rounded-full border shadow-sm" title="Completion Streak">
                    <Flame className={cn("w-4 h-4", streak > 0 ? "text-orange-500 fill-orange-500" : "text-muted-foreground")} />
                    <span className="font-bold text-sm">{streak}</span>
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <p className={cn(
                        "text-lg font-medium leading-tight",
                        task.status !== 'pending' && "text-muted-foreground"
                    )}>
                        {task.task}
                    </p>

                    {isPending ? (
                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateStatus('skipped')}
                                disabled={updating}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Skip
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleUpdateStatus('completed')}
                                disabled={updating}
                                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md transition-all hover:scale-105"
                            >
                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
                                Mark Done
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 shrink-0 animate-fade-in">
                            {task.status === 'completed' ? (
                                <span className="text-sm font-bold text-green-700 flex items-center bg-green-100 px-3 py-1 rounded-full">
                                    <Check className="w-3.5 h-3.5 mr-1.5" />
                                    Completed
                                </span>
                            ) : (
                                <span className="text-sm font-medium text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
                                    Skipped
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
