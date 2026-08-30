import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { addFeedingEntry, getFeedingHistory, deleteFeedingEntry, FeedingEntry } from '@/lib/db';
import { format, parseISO, isToday } from 'date-fns';
import { Cookie, Milk, Utensils, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function FeedingTracker() {
    const { currentUser } = useAuth();
    const [entries, setEntries] = useState<FeedingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [type, setType] = useState<'breast' | 'bottle' | 'solids'>('breast');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');

    // Default time to now
    const [time, setTime] = useState(format(new Date(), "HH:mm"));

    const fetchHistory = async () => {
        if (!currentUser) return;
        try {
            const data = await getFeedingHistory(currentUser.uid);
            setEntries(data);
        } catch (error) {
            console.error("Failed to load feeding history", error);
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
            const today = new Date();
            const [hours, minutes] = time.split(':');
            today.setHours(parseInt(hours), parseInt(minutes));

            await addFeedingEntry(currentUser.uid, {
                date: today.toISOString(),
                type,
                amount,
                note
            });

            toast.success("Feeding logged successfully!");
            setIsOpen(false);
            fetchHistory();

            // Reset form
            setAmount('');
            setNote('');
            setTime(format(new Date(), "HH:mm"));
        } catch (error) {
            toast.error("Failed to log feeding");
        }
    };

    const handleDelete = async (id: string) => {
        if (!currentUser) return;
        try {
            await deleteFeedingEntry(currentUser.uid, id);
            toast.success("Entry deleted");
            fetchHistory();
        } catch (error) {
            toast.error("Failed to delete entry");
        }
    };

    const todaysEntries = entries.filter(e => isToday(parseISO(e.date)));

    const getTypeIcon = (t: string) => {
        switch (t) {
            case 'breast': return <Cookie className="w-4 h-4 text-pink-500" />;
            case 'bottle': return <Milk className="w-4 h-4 text-blue-500" />;
            default: return <Utensils className="w-4 h-4 text-orange-500" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Milk className="w-5 h-5 text-primary" />
                    Feeding Log
                </h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline">Log Feeding</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Log Feeding</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={type} onValueChange={(v: any) => setType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="breast">Breastfeeding</SelectItem>
                                        <SelectItem value="bottle">Bottle / Formula</SelectItem>
                                        <SelectItem value="solids">Solids</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount/Duration</Label>
                                    <Input
                                        placeholder="e.g. 15m or 120ml"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Note</Label>
                                <Input
                                    placeholder="Optional notes..."
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSubmit}>Save Entry</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="text-center text-sm text-muted-foreground animate-pulse">Loading logs...</div>
            ) : todaysEntries.length === 0 ? (
                <div className="bg-muted/20 rounded-xl p-6 text-center text-sm text-muted-foreground border border-dashed">
                    No feeding entries for today.
                </div>
            ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {todaysEntries.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-card rounded-lg border shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    {getTypeIcon(entry.type)}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm flex items-center gap-2">
                                        {format(parseISO(entry.date), 'h:mm a')}
                                        <span className="text-xs font-normal text-muted-foreground capitalize">
                                            • {entry.type}
                                        </span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {entry.amount ? entry.amount : 'No amount specified'}
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
