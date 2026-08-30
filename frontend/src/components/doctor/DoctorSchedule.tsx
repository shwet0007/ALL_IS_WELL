import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkup, updateCheckupStatus } from '@/lib/db';
import {
    Calendar,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    Filter,
    Stethoscope,
    Baby
} from 'lucide-react';
import { format, parseISO, isToday, isPast, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DoctorScheduleProps {
    checkups: Checkup[];
    onRefresh: () => void;
}

export default function DoctorSchedule({ checkups, onRefresh }: DoctorScheduleProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');

    const handleStatusUpdate = async (checkupId: string, newStatus: 'completed' | 'cancelled') => {
        try {
            await updateCheckupStatus(checkupId, newStatus);
            toast.success(`Checkup marked as ${newStatus}`);
            onRefresh();
        } catch (error) {
            console.error('Error updating checkup:', error);
            toast.error('Failed to update checkup status');
        }
    };

    const filteredCheckups = checkups.filter(checkup => {
        const matchesSearch = checkup.patientName.toLowerCase().includes(searchTerm.toLowerCase());
        const date = parseISO(checkup.date);

        let matchesFilter = true;
        if (filter === 'today') matchesFilter = isToday(date);
        else if (filter === 'upcoming') matchesFilter = isFuture(date) || isToday(date);
        else if (filter === 'past') matchesFilter = isPast(date) && !isToday(date);

        return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="bg-card rounded-xl p-1 shadow-sm border border-border flex gap-1">
                    {['all', 'today', 'upcoming', 'past'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                                filter === f
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "hover:bg-muted text-muted-foreground"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-card"
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {filteredCheckups.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border-dashed border-2 border-border">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No checkups found for the selected filter.</p>
                    </div>
                ) : (
                    filteredCheckups.map((checkup) => (
                        <Card key={checkup.id} className={cn(
                            "transition-all hover:shadow-md border-l-4",
                            checkup.status === 'completed' ? "border-l-green-500 opacity-80" :
                                checkup.status === 'cancelled' ? "border-l-red-500 opacity-60" :
                                    "border-l-primary"
                        )}>
                            <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0",
                                        isToday(parseISO(checkup.date)) ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                    )}>
                                        {format(parseISO(checkup.date), 'd')}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{checkup.patientName}</h3>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {format(parseISO(checkup.date), 'h:mm a')}
                                            </span>
                                            <span className="flex items-center gap-1 capitalize">
                                                {checkup.type === 'pregnancy' ? <Stethoscope className="w-3 h-3" /> : <Baby className="w-3 h-3" />}
                                                {checkup.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {checkup.note && (
                                    <div className="bg-muted/50 px-3 py-2 rounded-lg text-sm text-muted-foreground md:max-w-xs truncate">
                                        "{checkup.note}"
                                    </div>
                                )}

                                <div className="flex gap-2 justify-end md:w-auto w-full">
                                    {checkup.status === 'scheduled' ? (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleStatusUpdate(checkup.id, 'cancelled')}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => handleStatusUpdate(checkup.id, 'completed')}
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                Complete
                                            </Button>
                                        </>
                                    ) : (
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold uppercase",
                                            checkup.status === 'completed' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        )}>
                                            {checkup.status}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
