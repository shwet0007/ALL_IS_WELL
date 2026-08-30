import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent, CalendarCategory, addCalendarEvent, updateCalendarEvent } from '@/lib/calendar-db';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AddEditEventDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date;
    existingEvent?: CalendarEvent | null;
    onSuccess: () => void;
}

const AddEditEventDialog: React.FC<AddEditEventDialogProps> = ({ isOpen, onClose, selectedDate, existingEvent, onSuccess }) => {
    const { currentUser } = useAuth();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<CalendarCategory>('Note');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (existingEvent) {
                setTitle(existingEvent.title);
                setCategory(existingEvent.category);
                setDescription(existingEvent.description || '');
            } else {
                setTitle('');
                setCategory('Note');
                setDescription('');
            }
        }
    }, [isOpen, existingEvent]);

    const handleSubmit = async () => {
        if (!currentUser) return;
        if (!title.trim()) {
            toast.error("Please enter a title");
            return;
        }

        setIsSubmitting(true);
        try {
            if (existingEvent) {
                await updateCalendarEvent(existingEvent.id, {
                    title,
                    category,
                    description
                });
                toast.success("Event updated");
            } else {
                await addCalendarEvent(currentUser.uid, {
                    date: selectedDate.toISOString().split('T')[0],
                    category,
                    title,
                    description
                });
                toast.success("Event added");
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Failed to save event");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{existingEvent ? 'Edit Entry' : 'New Entry'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={category} onValueChange={(v: CalendarCategory) => setCategory(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Note">📝 Personal Note</SelectItem>
                                <SelectItem value="Health">⚕️ Health / Symptom</SelectItem>
                                <SelectItem value="Baby Care">👶 Baby Care</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            placeholder="e.g. Morning Nausea, Pediatrician Visit"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea
                            placeholder="Details..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddEditEventDialog;
