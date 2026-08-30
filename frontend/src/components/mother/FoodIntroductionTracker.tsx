import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addFoodIntroEntry, getFoodIntroHistory, FoodIntroEntry, deleteFoodIntroEntry } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Calendar, Smile, AlertCircle, Frown } from 'lucide-react';
import { format } from 'date-fns';

export default function FoodIntroductionTracker() {
    const { currentUser } = useAuth();
    const [logs, setLogs] = useState<FoodIntroEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [foodName, setFoodName] = useState('');
    const [introDate, setIntroDate] = useState(new Date().toISOString().split('T')[0]);
    const [reaction, setReaction] = useState<'good' | 'bad' | 'gas' | 'constipation' | 'allergy' | 'rash'>('good');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (currentUser) {
            fetchLogs();
        }
    }, [currentUser]);

    const fetchLogs = async () => {
        if (!currentUser) return;
        const data = await getFoodIntroHistory(currentUser.uid);
        setLogs(data);
        setLoading(false);
    };

    const handleAddLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !foodName) return;

        try {
            await addFoodIntroEntry(currentUser.uid, {
                foodName,
                introductionDate: introDate,
                reaction,
                notes
            });
            setFoodName('');
            setNotes('');
            setReaction('good');
            fetchLogs();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!currentUser) return;
        await deleteFoodIntroEntry(currentUser.uid, id);
        fetchLogs();
    };

    const getReactionIcon = (r: string) => {
        switch (r) {
            case 'good': return <Smile className="w-4 h-4 text-green-500" />;
            case 'allergy':
            case 'rash': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Frown className="w-4 h-4 text-amber-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-peach-100 shadow-sm bg-peach-50/30">
                <CardContent className="pt-6">
                    <form onSubmit={handleAddLog} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Food Name</Label>
                                <Input
                                    placeholder="e.g. Mashed Banana"
                                    value={foodName}
                                    onChange={(e) => setFoodName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Date Introduced</Label>
                                <Input
                                    type="date"
                                    value={introDate}
                                    onChange={(e) => setIntroDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Reaction</Label>
                                <Select value={reaction} onValueChange={(val: any) => setReaction(val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="good">Good (No issues)</SelectItem>
                                        <SelectItem value="gas">Gas / Fussiness</SelectItem>
                                        <SelectItem value="constipation">Constipation</SelectItem>
                                        <SelectItem value="bad">Bad / Disliked</SelectItem>
                                        <SelectItem value="allergy">Allergy Found</SelectItem>
                                        <SelectItem value="rash">Skin Rash</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Notes (Optional)</Label>
                                <Input
                                    placeholder="e.g. Ate with enthusiasm"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full gap-2">
                            <Plus className="w-4 h-4" /> Log New Food
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Food Introduction History
                </h3>
                {logs.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic bg-muted/50 p-4 rounded-lg text-center">
                        No foods logged yet. Start by adding your baby's first solid food!
                    </p>
                ) : (
                    <div className="grid gap-3">
                        {logs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-muted rounded-full">
                                        {getReactionIcon(log.reaction)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">{log.foodName}</h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{format(new Date(log.introductionDate), 'MMM d, yyyy')}</span>
                                            <span>•</span>
                                            <span className="capitalize">{log.reaction}</span>
                                        </div>
                                        {log.notes && <p className="text-xs mt-1 text-muted-foreground italic">"{log.notes}"</p>}
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(log.id)} className="text-destructive hover:bg-destructive/10">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
