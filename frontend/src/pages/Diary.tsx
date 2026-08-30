import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDiaryEntries, getTodayDateString, DiaryEntry } from '@/lib/diary';
import DiaryEntryCard from '@/components/diary/DiaryEntryCard';
import DiaryTimeline from '@/components/diary/DiaryTimeline';
import AddEditDiaryModal from '@/components/diary/AddEditDiaryModal';
import DiaryCalendar from '@/components/diary/DiaryCalendar';
import MilestoneFlashcards from '@/components/diary/MilestoneFlashcards';
import { Button } from '@/components/ui/button';
import { Plus, BookHeart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Diary: React.FC = () => {
    const { currentUser } = useAuth();
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [modalDate, setModalDate] = useState<string>(getTodayDateString());

    const today = getTodayDateString();

    const fetchEntries = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const data = await getDiaryEntries(currentUser.uid);
            setEntries(data);
        } catch (error: any) {
            console.error("Failed to fetch diary entries", error);
            if (error?.message?.includes("index")) {
                toast.error("System Error: Missing Database Index. Open console for link to create it.");
            } else {
                toast.error("Failed to load diary entries.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, [currentUser]);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        const dateStr = date.toISOString().split('T')[0];

        // Find if entry exists for this date
        const entry = entries.find(e => e.date === dateStr);

        if (entry) {
            // If entry exists, open it for editing/viewing
            setSelectedEntry(entry);
            setModalDate(dateStr);
            setIsModalOpen(true);
        } else {
            // No entry. Check if future
            if (dateStr > today) {
                toast.error("You cannot write memory for future dates.");
                return;
            }
            // Allow creating new entry for this date
            setSelectedEntry(null);
            setModalDate(dateStr);
            // Optional: Auto open modal? Or let user click "Add"? 
            // Requirement says "Allow users to select a date to... Create a new entry"
            // Let's autoshow modal for convenience if the user explicitly clicked the date
            setIsModalOpen(true);
        }
    };

    const handleAddClick = () => {
        // Default button "Write Today"
        const todayEntry = entries.find(e => e.date === today);
        if (todayEntry) {
            setSelectedEntry(todayEntry);
        } else {
            setSelectedEntry(null);
        }
        setModalDate(today);
        setSelectedDate(new Date());
        setIsModalOpen(true);
    };

    const handleEditClick = (entry: DiaryEntry) => {
        setSelectedEntry(entry);
        setModalDate(entry.date);
        setSelectedDate(new Date(entry.date));
        setIsModalOpen(true);
    };

    const handleSaveSuccess = () => {
        fetchEntries(); // Refresh list
    };

    if (loading) {
        return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    const todayEntry = entries.find(e => e.date === today);

    return (
        <div className="animate-fade-in space-y-8 flex flex-col items-center max-w-4xl mx-auto w-full">
            {/* Header Section */}
            <div className="w-full flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-stone-800">My Secret Diary</h2>
                    <p className="text-stone-500">A safe space for your thoughts</p>
                </div>
                {!todayEntry && (
                    <Button onClick={handleAddClick} className="bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
                        <Plus className="w-5 h-5 mr-2" />
                        Write Today
                    </Button>
                )}
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column: Calendar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="sticky top-4">
                        <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
                            Calendar
                        </h3>
                        <DiaryCalendar
                            entries={entries}
                            selectedDate={selectedDate}
                            onDateSelect={handleDateSelect}
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Right Column: Today & Timeline */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Today's Memory Card */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <BookHeart className="w-6 h-6 text-primary" />
                            <h3 className="text-xl font-semibold text-stone-700">Today's Memory</h3>
                        </div>

                        {todayEntry ? (
                            <DiaryEntryCard
                                entry={todayEntry}
                                onClick={() => handleEditClick(todayEntry)}
                                className="bg-white border-primary/20 ring-4 ring-primary/5 hover:ring-primary/10"
                            />
                        ) : (
                            <div
                                onClick={handleAddClick}
                                className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl p-8 text-center cursor-pointer hover:bg-stone-100 hover:border-primary/50 transition-all group"
                            >
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                    <Plus className="w-6 h-6 text-stone-400 group-hover:text-primary" />
                                </div>
                                <h4 className="font-semibold text-stone-700">No memory recorded for today</h4>
                                <p className="text-sm text-stone-500">Tap to start writing...</p>
                            </div>
                        )}
                    </section>

                    {/* Timeline */}
                    {entries.length > 0 && (
                        <section className="pt-4 border-t border-stone-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-stone-700">Your Journey</h3>
                                <span className="text-xs text-stone-400">{entries.length} memories</span>
                            </div>

                            <DiaryTimeline
                                entries={entries}
                                onEntryClick={handleEditClick}
                            />
                        </section>
                    )}

                    {/* Milestone Flashcards Section */}
                    <MilestoneFlashcards entries={entries} />
                </div>
            </div>

            <AddEditDiaryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={currentUser?.uid || ''}
                existingEntry={selectedEntry}
                selectedDate={modalDate} // Pass the date to enforce creation for that date
                onSaveSuccess={handleSaveSuccess}
                onDeleteSuccess={handleSaveSuccess}
            />
        </div>
    );
};

export default Diary;

