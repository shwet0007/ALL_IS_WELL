import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { addSleepSession, getSleepHistory, deleteSleepSession, SleepSession } from '@/lib/db';
import { format, parseISO, isToday, differenceInMinutes } from 'date-fns';
import { Moon, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SleepTracker() {
    const { currentUser } = useAuth();
    const [entries, setEntries] = useState<SleepSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [start, setStart] = useState(format(new Date(), "HH:mm"));
    const [end, setEnd] = useState(format(new Date(), "HH:mm"));
    const [note, setNote] = useState('');

    const fetchHistory = async () => {
        if (!currentUser) return;
        try {
            const data = await getSleepHistory(currentUser.uid);
            setEntries(data);
        } catch (error) {
            console.error("Failed to load sleep history", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [currentUser]);

    const handleSubmit = async () => {
        if (!currentUser) return;

        try {
            const today = new Date(); // Assuming logging for today for simplicity

            const [startH, startM] = start.split(':');
            const startTime = new Date(today);
            startTime.setHours(parseInt(startH), parseInt(startM));

            const [endH, endM] = end.split(':');
            const endTime = new Date(today);
            endTime.setHours(parseInt(endH), parseInt(endM));

            // Handle overnight sleep logging (simple version: if end < start, assume next day? Not tackling complex dates yet)
            // For now, let's just log durations.
            let durationMins = differenceInMinutes(endTime, startTime);
            if (durationMins < 0) durationMins += 24 * 60; // Simple fix for overnight crossing midnight if assumed strictly hours

            const hours = Math.floor(durationMins / 60);
            const minutes = durationMins % 60;
            const duration = `${hours}h ${minutes}m`;

            await addSleepSession(currentUser.uid, {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                duration,
                note
            });

            toast.success("Sleep session logged!");
            setIsOpen(false);
            fetchHistory();

            // Reset
            setNote('');
        } catch (error) {
            toast.error("Failed to log sleep");
        }
    };

    const handleDelete = async (id: string) => {
        if (!currentUser) return;
        try {
            await deleteSleepSession(currentUser.uid, id);
            toast.success("Entry deleted");
            fetchHistory();
        } catch (error) {
            toast.error("Failed to delete entry");
        }
    };

    const todaysEntries = entries.filter(e => isToday(parseISO(e.startTime)));

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Moon className="w-5 h-5 text-indigo-500" />
                    Sleep Log
                </h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline">Log Sleep</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Log Sleep Session</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Sleep Time</Label>
                                    <Input type="time" value={start} onChange={e => setStart(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Wake Time</Label>
                                    <Input type="time" value={end} onChange={e => setEnd(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Note</Label>
                                <Input
                                    placeholder="e.g. Fussy before sleeping..."
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSubmit}>Save Session</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="text-center text-sm text-muted-foreground animate-pulse">Loading logs...</div>
            ) : todaysEntries.length === 0 ? (
                <div className="bg-muted/20 rounded-xl p-6 text-center text-sm text-muted-foreground border border-dashed">
                    No sleep sessions logged today.
                </div>
            ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {todaysEntries.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-card rounded-lg border shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-500/10 p-2 rounded-full">
                                    <Moon className="w-4 h-4 text-indigo-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm flex items-center gap-2">
                                        {format(parseISO(entry.startTime), 'h:mm a')} - {entry.endTime && format(parseISO(entry.endTime), 'h:mm a')}
                                    </p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {entry.duration}
                                        {entry.note && ` • ${entry.note}`}
                                    </p>
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(entry.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
