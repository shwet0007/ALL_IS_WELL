import React, { useState, useEffect } from 'react';
import {
    Plus,
    Calendar as CalendarIcon,
    Clock,
    Trash2,
    CheckCircle2,
    Circle,
    Utensils,
    Moon,
    Pill,
    Stethoscope,
    Heart,
    MoreVertical,
    Edit,
    ChevronLeft,
    Loader2,
    Baby,
    Syringe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types & DB
import {
    ScheduleItem,
    getSchedule,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    clearSchedule
} from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { generatePersonalizedSchedule } from '@/lib/groq';

// Types
type ActivityType = 'feeding' | 'sleep' | 'medication' | 'checkup' | 'vaccination' | 'other';


const typeIcons: Record<ActivityType, React.ReactNode> = {
    feeding: <Utensils className="w-4 h-4" />,
    sleep: <Moon className="w-4 h-4" />,
    medication: <Pill className="w-4 h-4" />,
    checkup: <Stethoscope className="w-4 h-4" />,
    vaccination: <Syringe className="w-4 h-4" />,
    other: <Heart className="w-4 h-4" />,
};

const typeColors: Record<ActivityType, string> = {
    feeding: 'bg-orange-100 text-orange-600 border-orange-200',
    sleep: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    medication: 'bg-purple-100 text-purple-600 border-purple-200',
    checkup: 'bg-blue-100 text-blue-600 border-blue-200',
    vaccination: 'bg-secondary text-secondary-foreground border-secondary/20',
    other: 'bg-pink-100 text-pink-600 border-pink-200',
};

export default function Schedule() {
    const { currentUser, userProfile } = useAuth();
    const [items, setItems] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

    // Form State
    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemTime, setNewItemTime] = useState('');
    const [newItemType, setNewItemType] = useState<any>('other');

    useEffect(() => {
        if (currentUser && userProfile) {
            loadSchedule();
        }
    }, [currentUser, userProfile]);

    const loadSchedule = async () => {
        if (!currentUser || !userProfile) return;
        try {
            const fetchedItems = await getSchedule(currentUser.uid);

            // If no schedule exists, auto-generate one based on role
            if (fetchedItems.length === 0) {
                console.log('No schedule found, auto-generating for role:', userProfile.role);
                await generateAndSaveSchedule();
            } else {
                setItems(fetchedItems);
            }
        } catch (error) {
            console.error("Failed to load schedule", error);
        } finally {
            setLoading(false);
        }
    };

    const generateAndSaveSchedule = async () => {
        if (!currentUser || !userProfile) return;
        try {
            const generatedItems = await generatePersonalizedSchedule(userProfile);

            // Add generated items to Firestore
            const savedItems: ScheduleItem[] = [];
            for (const item of generatedItems) {
                const savedItem = await addScheduleItem(currentUser.uid, {
                    title: item.title,
                    time: item.time,
                    type: item.type || 'other',
                    completed: false,
                    note: item.note || ''
                });
                savedItems.push(savedItem);
            }

            setItems(savedItems);
        } catch (error) {
            console.error("Failed to auto-generate schedule", error);
            setItems([]);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        const newItemData = {
            title: newItemTitle,
            time: newItemTime,
            type: newItemType,
            completed: false,
        };

        try {
            const addedItem = await addScheduleItem(currentUser.uid, newItemData);
            setItems([...items, addedItem].sort((a, b) => a.time.localeCompare(b.time)));
            setIsAddDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error("Failed to add item", error);
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!currentUser) return;
        try {
            await deleteScheduleItem(currentUser.uid, id);
            setItems(items.filter(item => item.id !== id));
        } catch (error) {
            console.error("Failed to delete item", error);
        }
    };

    const toggleComplete = async (id: string) => {
        if (!currentUser) return;
        const item = items.find(i => i.id === id);
        if (!item) return;

        try {
            await updateScheduleItem(currentUser.uid, id, { completed: !item.completed });
            setItems(items.map(item =>
                item.id === id ? { ...item, completed: !item.completed } : item
            ));
        } catch (error) {
            console.error("Failed to update item", error);
        }
    };

    const resetForm = () => {
        setNewItemTitle('');
        setNewItemTime('');
        setNewItemType('other');
        setEditingItem(null);
    };

    const handleEditItem = (item: ScheduleItem) => {
        setEditingItem(item);
        setNewItemTitle(item.title);
        setNewItemTime(item.time);
        setNewItemType(item.type);
        setIsEditDialogOpen(true);
    };

    const handleUpdateItem = async () => {
        if (!currentUser || !editingItem) return;
        if (!newItemTitle.trim() || !newItemTime.trim()) return;

        try {
            const updatedItem = {
                title: newItemTitle,
                time: newItemTime,
                type: newItemType as ActivityType,
            };

            await updateScheduleItem(currentUser.uid, editingItem.id, updatedItem);
            setItems(items.map(item =>
                item.id === editingItem.id ? { ...item, ...updatedItem } : item
            ).sort((a, b) => a.time.localeCompare(b.time)));
            setIsEditDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error("Failed to update item", error);
        }
    };

    const handleClearAll = async () => {
        if (!currentUser) return;
        try {
            setLoading(true);
            await clearSchedule(currentUser.uid);
            setItems([]);
        } catch (error) {
            console.error("Failed to clear schedule", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Daily Schedule</h2>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {items.length > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10">
                                    <Trash2 className="w-4 h-4" />
                                    Clear All
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete all items from your daily schedule. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete Everything
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 shadow-lg hover:shadow-xl transition-all">
                                <Plus className="w-4 h-4" />
                                Add Activity
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Activity</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddItem} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Activity Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Evening Walk"
                                        value={newItemTitle}
                                        onChange={(e) => setNewItemTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="time">Time</Label>
                                        <Input
                                            id="time"
                                            type="time"
                                            value={newItemTime}
                                            onChange={(e) => setNewItemTime(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Category</Label>
                                        <Select value={newItemType} onValueChange={(v: ActivityType) => setNewItemType(v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="feeding">Feeding / Diet</SelectItem>
                                                <SelectItem value="sleep">Rest / Sleep</SelectItem>
                                                <SelectItem value="medication">Medication</SelectItem>
                                                <SelectItem value="checkup">Doctor Checkup</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Add to Schedule</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Schedule List */}
            <div className="grid gap-4">
                {items.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent className="space-y-4">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">No activities yet</h3>
                                <p className="text-muted-foreground">Add activities to plan your day efficiently.</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    items.map((item) => (
                        <Card key={item.id} className={cn(
                            "transition-all duration-300 hover:shadow-md border-l-4",
                            item.completed ? "opacity-70 bg-muted/30" : "bg-card",
                            typeColors[item.type].split(' ')[2] // Use only border color class
                        )}>
                            <CardContent className="p-4 flex items-center gap-4">
                                {/* Checkbox */}
                                <button
                                    onClick={() => toggleComplete(item.id)}
                                    className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                        item.completed
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : "border-muted-foreground hover:border-primary"
                                    )}
                                >
                                    {item.completed && <CheckCircle2 className="w-4 h-4" />}
                                </button>

                                {/* Time */}
                                <div className="flex flex-col items-center min-w-[3rem] text-center">
                                    <span className="text-sm font-bold text-muted-foreground">{item.time}</span>
                                    {/* <span className="text-xs text-muted-foreground">AM</span> */}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={cn(
                                            "font-semibold truncate",
                                            item.completed && "line-through text-muted-foreground"
                                        )}>
                                            {item.title}
                                        </h3>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1",
                                            typeColors[item.type].split(' ').slice(0, 2).join(' ') // bg and text classes
                                        )}>
                                            {typeIcons[item.type]}
                                            <span className="capitalize">{item.type}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteItem(item.id)}>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Schedule Activity</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">Activity Title</Label>
                            <Input
                                id="edit-title"
                                placeholder="e.g., Morning Walk"
                                value={newItemTitle}
                                onChange={(e) => setNewItemTitle(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-time">Time</Label>
                                <div className="relative">
                                    <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="edit-time"
                                        type="time"
                                        className="pl-8"
                                        value={newItemTime}
                                        onChange={(e) => setNewItemTime(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-type">Type</Label>
                                <Select value={newItemType} onValueChange={setNewItemType}>
                                    <SelectTrigger id="edit-type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="feeding">Feeding / Diet</SelectItem>
                                        <SelectItem value="sleep">Rest / Sleep</SelectItem>
                                        <SelectItem value="medication">Medication</SelectItem>
                                        <SelectItem value="checkup">Doctor Checkup</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between sm:justify-between items-center sm:gap-2">
                        <Button
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                                if (editingItem) {
                                    handleDeleteItem(editingItem.id);
                                    setIsEditDialogOpen(false);
                                }
                            }}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateItem}>Save Changes</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
