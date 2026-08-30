import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { addMilestone, getMilestones, deleteMilestone, GrowthMilestone } from '@/lib/db';
import { format, parseISO } from 'date-fns';
import { Ruler, Trash2, TrendingUp, Baby } from 'lucide-react';
import { toast } from 'sonner';

export default function MilestoneTracker() {
    const { currentUser } = useAuth();
    const [milestones, setMilestones] = useState<GrowthMilestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [category, setCategory] = useState<'growth' | 'development'>('growth');
    const [title, setTitle] = useState('');
    const [value, setValue] = useState('');
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [note, setNote] = useState('');

    const fetchHistory = async () => {
        if (!currentUser) return;
        try {
            const data = await getMilestones(currentUser.uid);
            setMilestones(data);
        } catch (error) {
            console.error("Failed to load milestones", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [currentUser]);

    const handleSubmit = async () => {
        if (!currentUser) return;
        if (!title) {
            toast.error("Please enter a milestone name");
            return;
        }

        try {
            await addMilestone(currentUser.uid, {
                date: new Date(date).toISOString(),
                category,
                title,
                value,
                note
            });

            toast.success("Milestone achieved! 🎉");
            setIsOpen(false);
            fetchHistory();

            // Reset
            setTitle('');
            setValue('');
            setNote('');
        } catch (error) {
            toast.error("Failed to save milestone");
        }
    };

    const handleDelete = async (id: string) => {
        if (!currentUser) return;
        try {
            await deleteMilestone(currentUser.uid, id);
            toast.success("Entry deleted");
            fetchHistory();
        } catch (error) {
            toast.error("Failed to delete entry");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Growth & Milestones
                </h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline">Add Milestone</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Track Milestone</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={category} onValueChange={(v: any) => {
                                    setCategory(v);
                                    setTitle(''); // Reset title when category changes
                                }}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="growth">Growth (Weight/Height)</SelectItem>
                                        <SelectItem value="development">Development (Firsts)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Milestone Name</Label>
                                {category === 'growth' ? (
                                    <Select value={title} onValueChange={setTitle}>
                                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Weight">Weight</SelectItem>
                                            <SelectItem value="Height">Height</SelectItem>
                                            <SelectItem value="Head Circumference">Head Circumference</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        placeholder="e.g. Rolling Over, First Smile"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date Achieved</Label>
                                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>{category === 'growth' ? 'Value' : 'Details (Optional)'}</Label>
                                    <Input
                                        placeholder={category === 'growth' ? "e.g. 5.2 kg" : "Specific detail"}
                                        value={value}
                                        onChange={e => setValue(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Note</Label>
                                <Input
                                    placeholder="Memorable details..."
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSubmit}>Save Milestone</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="text-center text-sm text-muted-foreground animate-pulse">Loading logs...</div>
            ) : milestones.length === 0 ? (
                <div className="bg-muted/20 rounded-xl p-6 text-center text-sm text-muted-foreground border border-dashed">
                    No milestones recorded yet. Capture every moment!
                </div>
            ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {milestones.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-card rounded-lg border shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-500/10 p-2 rounded-full">
                                    {entry.category === 'growth' ? <Ruler className="w-4 h-4 text-green-500" /> : <Baby className="w-4 h-4 text-green-500" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm flex items-center gap-2">
                                        {entry.title}
                                        {entry.value && <span className="bg-green-500/10 text-green-700 px-2 rounded text-xs">{entry.value}</span>}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(parseISO(entry.date), 'MMM d, yyyy')}
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
