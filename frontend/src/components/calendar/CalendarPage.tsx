import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parseISO, isSameDay } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { getUserCalendarEvents, CalendarEvent, deleteCalendarEvent } from '@/lib/calendar-db';
import { getDiaryEntries } from '@/lib/diary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AddEditEventDialog from './AddEditEventDialog';
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit2, Calendar as CalendarIcon, BookHeart } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CalendarPage = () => {
    const { currentUser } = useAuth();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

    const fetchEvents = async () => {
        if (currentUser) {
            console.log("Fetching events for user:", currentUser.uid);
            let calendarData: CalendarEvent[] = [];
            let diaryData: any[] = [];

            try {
                calendarData = await getUserCalendarEvents(currentUser.uid);
                console.log("Fetched calendar events:", calendarData.length);
            } catch (error) {
                console.error("Failed to fetch calendar events:", error);
            }

            try {
                diaryData = await getDiaryEntries(currentUser.uid);
                console.log("Fetched diary entries raw:", diaryData);
            } catch (error) {
                console.error("Failed to fetch diary entries:", error);
            }

            // Transform diary entries to calendar events
            const diaryEvents: CalendarEvent[] = diaryData.map(entry => ({
                id: `diary_${entry.id}`,
                userId: entry.userId,
                date: entry.date,
                category: 'Diary' as any,
                title: 'Diary Entry',
                description: entry.text || 'No content',
                isReadOnly: true
            }));

            console.log("Transformed diary events:", diaryEvents);

            const allEvents = [...calendarData, ...diaryEvents];
            console.log("Total events to set:", allEvents.length);
            setEvents(allEvents);
        } else {
            console.log("No current user, skipping fetch");
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [currentUser]);

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        setSelectedDate(date);
        setIsSheetOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this event?")) {
            await deleteCalendarEvent(id);
            toast.success("Event deleted");
            fetchEvents();
        }
    };

    const handleEdit = (event: CalendarEvent) => {
        setEditingEvent(event);
        setIsDialogOpen(true);
    };

    const selectedEvents = events.filter(e => isSameDay(parseISO(e.date), selectedDate));

    // Custom modifiers
    const hasEvent = (date: Date) => {
        return events.some(e => isSameDay(parseISO(e.date), date));
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-3 rounded-full">
                    <CalendarIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">My Calendar</h2>
                    <p className="text-muted-foreground">Track health events and memories</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <Card className="md:col-span-2 border-none shadow-soft rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            modifiers={{ hasEvent }}
                            className="mx-auto w-full"
                            classNames={{
                                month: "space-y-6 w-full",
                                caption: "flex justify-center pt-2 relative items-center mb-4",
                                caption_label: "text-2xl font-bold text-stone-700 font-display",
                                nav: "space-x-2 flex items-center bg-stone-50 rounded-full p-1",
                                nav_button: "h-8 w-8 bg-white shadow-sm p-0 hover:bg-white hover:text-primary transition-all rounded-full border border-stone-100",
                                table: "w-full border-collapse space-y-2",
                                head_row: "flex w-full mb-2",
                                head_cell: "text-stone-400 rounded-md w-full font-medium text-xs uppercase tracking-wider py-2",
                                row: "flex w-full mt-2",
                                cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20 flex-1",
                                day: "h-12 w-12 p-0 mx-auto font-medium aria-selected:opacity-100 hover:bg-primary/5 rounded-full transition-all flex items-center justify-center text-stone-600 group",
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-lg shadow-primary/20 scale-110",
                                day_today: "bg-orange-50 text-orange-700 font-bold border border-orange-100",
                            }}
                            components={{
                                IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                                IconRight: () => <ChevronRight className="h-4 w-4" />,
                                DayContent: (props) => {
                                    const dayEvents = events.filter(e => isSameDay(parseISO(e.date), props.date));
                                    const hasHealth = dayEvents.some(e => e.category === 'Health');
                                    const hasBaby = dayEvents.some(e => e.category === 'Baby Care');
                                    const hasNote = dayEvents.some(e => e.category === 'Note');
                                    const hasDiary = dayEvents.some(e => (e as any).category === 'Diary');

                                    return (
                                        <div className="flex flex-col items-center justify-center h-full relative w-full">
                                            <span className="z-10 relative text-sm">{props.date.getDate()}</span>
                                            <div className="flex gap-0.5 absolute bottom-2">
                                                {hasHealth && <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-sm ring-1 ring-white" />}
                                                {hasBaby && <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-sm ring-1 ring-white" />}
                                                {hasNote && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm ring-1 ring-white" />}
                                                {hasDiary && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm ring-1 ring-white" />}
                                            </div>
                                        </div>
                                    );
                                }
                            }}
                        />
                    </CardContent>
                </Card>

                <div className="hidden md:block space-y-4">
                    <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/30">
                        <h3 className="font-semibold text-lg mb-2">{format(selectedDate, 'MMM d, yyyy')}</h3>
                        {selectedEvents.length === 0 ? (
                            <p className="text-sm text-muted-foreground mb-4">No events for this day.</p>
                        ) : (
                            <div className="space-y-3 mb-4">
                                {selectedEvents.map(event => (
                                    <div key={event.id} className="bg-white p-3 rounded-lg border shadow-sm text-sm">
                                        <div className="flex justify-between items-start">
                                            <span className={cn(
                                                "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider mb-1 inline-block",
                                                event.category === 'Health' ? "bg-red-100 text-red-700" :
                                                    event.category === 'Baby Care' ? "bg-blue-100 text-blue-700" :
                                                        (event as any).category === 'Diary' ? "bg-green-100 text-green-700" :
                                                            "bg-yellow-100 text-yellow-700"
                                            )}>
                                                {event.category}
                                            </span>
                                            {(event as any).category === 'Diary' && (
                                                <BookHeart className="w-3 h-3 text-green-600" />
                                            )}
                                        </div>
                                        <p className="font-medium">{event.title}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Button className="w-full" onClick={() => setIsSheetOpen(true)}>
                            Manage Entries
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile/Detail Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle>
                            {format(selectedDate, 'EEEE, MMMM d')}
                        </SheetTitle>
                    </SheetHeader>

                    <div className="space-y-6">
                        <Button className="w-full" onClick={() => {
                            setEditingEvent(null);
                            setIsDialogOpen(true);
                        }}>
                            <Plus className="w-4 h-4 mr-2" /> Add Entry
                        </Button>

                        <div className="space-y-4">
                            {selectedEvents.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    No entries yet for this day.
                                </div>
                            ) : (
                                selectedEvents.map(event => (
                                    <div key={event.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-2">
                                        <div className="flex justify-between items-start">
                                            <span className={cn(
                                                "text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider",
                                                event.category === 'Health' ? "bg-red-100 text-red-700" :
                                                    event.category === 'Baby Care' ? "bg-blue-100 text-blue-700" :
                                                        (event as any).category === 'Diary' ? "bg-green-100 text-green-700" :
                                                            "bg-yellow-100 text-yellow-700"
                                            )}>
                                                {event.category}
                                            </span>
                                            {(event as any).category === 'Diary' ? (
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <BookHeart className="w-3 h-3 text-green-600" /> Diary
                                                </div>
                                            ) : (
                                                <div className="flex gap-1">
                                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleEdit(event)}>
                                                        <Edit2 className="w-3 h-3" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => handleDelete(event.id)}>
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <h4 className="font-bold">{event.title}</h4>
                                        {event.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <AddEditEventDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                selectedDate={selectedDate}
                existingEvent={editingEvent}
                onSuccess={() => {
                    fetchEvents();
                }}
            />
        </div>
    );
};

export default CalendarPage;
