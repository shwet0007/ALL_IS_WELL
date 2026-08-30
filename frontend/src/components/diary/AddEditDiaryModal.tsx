import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DiaryEntry, MoodType, uploadDiaryImage, saveDiaryEntry, getTodayDateString, deleteDiaryEntry } from '@/lib/diary';
import { Loader2, ImagePlus, X, Smile, Meh, Frown, AlertCircle, BatteryMedium, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddEditDiaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    existingEntry?: DiaryEntry | null;
    selectedDate?: string; // Optional: Force a specific date (YYYY-MM-DD)
    onSaveSuccess: () => void;
    onDeleteSuccess?: () => void;
}

const moodOptions: { value: MoodType; icon: any; label: string }[] = [
    { value: 'Happy', icon: Smile, label: 'Happy' },
    { value: 'Neutral', icon: Meh, label: 'Neutral' },
    { value: 'Tired', icon: BatteryMedium, label: 'Tired' },
    { value: 'Anxious', icon: AlertCircle, label: 'Anxious' },
    { value: 'Unwell', icon: Frown, label: 'Unwell' },
];

const medicalConditionOptions = [
    "Fever",
    "Nausea",
    "Headache",
    "Fatigue",
    "Body Pain",
    "Anxiety/Stress"
];

const milestoneCategories = {
    "Infant Milestones": [
        "First smile",
        "First laugh",
        "First roll over",
        "First solid food",
        "First word",
        "First step"
    ],
    "Pregnancy Milestones": [
        "First kick felt",
        "First scan",
        "Entered 2nd trimester",
        "Baby name decided"
    ],
    "Personal Moments": [
        "Felt confident today",
        "First outing with baby",
        "Emotional breakthrough"
    ]
};

const AddEditDiaryModal: React.FC<AddEditDiaryModalProps> = ({ isOpen, onClose, userId, existingEntry, selectedDate, onSaveSuccess, onDeleteSuccess }) => {
    const [mood, setMood] = useState<MoodType>('Neutral');
    const [text, setText] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [conditions, setConditions] = useState<string[]>([]);
    const [otherCondition, setOtherCondition] = useState('');
    const [isOtherChecked, setIsOtherChecked] = useState(false);

    // Milestone States
    const [isMilestone, setIsMilestone] = useState(false);
    const [milestoneTitle, setMilestoneTitle] = useState('');
    const [milestoneCategory, setMilestoneCategory] = useState('');
    const [milestoneDescription, setMilestoneDescription] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [isCustomCategory, setIsCustomCategory] = useState(false);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const targetDate = selectedDate || getTodayDateString();

    useEffect(() => {
        if (existingEntry) {
            setMood(existingEntry.mood);
            setText(existingEntry.text || '');
            setImages(existingEntry.imageUrls || []);

            // Parse conditions
            const savedConditions = existingEntry.medicalConditions || [];
            const standardConditions = savedConditions.filter(c => medicalConditionOptions.includes(c));
            const other = savedConditions.find(c => !medicalConditionOptions.includes(c));

            setConditions(standardConditions);
            if (other) {
                setIsOtherChecked(true);
                setOtherCondition(other);
            } else {
                setIsOtherChecked(false);
                setOtherCondition('');
            }

            // Milestone
            setIsMilestone(!!existingEntry.isMilestone);
            setMilestoneTitle(existingEntry.milestoneTitle || '');
            setMilestoneCategory(existingEntry.milestoneCategory || '');
            setMilestoneDescription(existingEntry.milestoneDescription || '');
            setIsCustomCategory(false);
            setCustomCategory('');
        } else {
            // Reset for new entry
            setMood('Neutral');
            setText('');
            setImages([]);
            setConditions([]);
            setIsOtherChecked(false);
            setOtherCondition('');
            setIsMilestone(false);
            setMilestoneTitle('');
            setMilestoneCategory('');
            setMilestoneDescription('');
            setIsCustomCategory(false);
            setCustomCategory('');
        }
    }, [existingEntry, isOpen]);

    const handleConditionToggle = (condition: string) => {
        setConditions(prev =>
            prev.includes(condition)
                ? prev.filter(c => c !== condition)
                : [...prev, condition]
        );
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            if (images.length >= 3) {
                toast.error("Maximum 3 images allowed");
                return;
            }

            const file = e.target.files[0];
            if (file.size > 3 * 1024 * 1024) {
                toast.error("Image size must be less than 3MB");
                return;
            }

            setUploading(true);
            try {
                const url = await uploadDiaryImage(file, userId);
                setImages(prev => [...prev, url]);
                toast.success("Image uploaded!");
            } catch (error: any) {
                console.error(error);
                toast.error(error.message || "Failed to upload image");
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const dateToSave = existingEntry ? existingEntry.date : targetDate;

            // Validation: Milestone title is required if isMilestone is true
            if (isMilestone && !milestoneTitle.trim()) {
                toast.error("Please provide a title for your milestone.");
                setLoading(false);
                return;
            }

            // Combine conditions
            const finalConditions = [...conditions];
            if (isOtherChecked && otherCondition.trim()) {
                finalConditions.push(otherCondition.trim());
            }

            await saveDiaryEntry(userId, {
                date: dateToSave,
                mood,
                text: text || '',
                imageUrls: images || [],
                medicalConditions: finalConditions || [],
                isMilestone: !!isMilestone,
                milestoneTitle: isMilestone ? (milestoneTitle || '') : '',
                milestoneCategory: isMilestone ? (isCustomCategory ? (customCategory || 'Other') : (milestoneCategory || 'Personal')) : '',
                milestoneDescription: isMilestone ? (milestoneDescription || '') : ''
            });

            toast.success("Diary entry saved!");
            onSaveSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to save entry");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!existingEntry) return;
        if (!confirm("Are you sure you want to delete this memory? You can then write a new one.")) return;

        setLoading(true);
        try {
            // Use the unique ID if available, otherwise fallback to date
            const entryId = existingEntry.id || existingEntry.date;
            await deleteDiaryEntry(userId, entryId);
            toast.success("Memory deleted.");
            if (onDeleteSuccess) onDeleteSuccess();
            onClose();
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete memory.");
        } finally {
            setLoading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {existingEntry ? 'Edit Memory' : 'New Memory'}
                        <span className="ml-2 text-sm font-normal text-stone-500">
                            ({new Date(targetDate.replace(/-/g, '/')).toLocaleDateString()})
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Mood Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-600">How are you feeling?</label>
                        <div className="flex justify-between gap-1 overflow-x-auto pb-2">
                            {moodOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setMood(option.value)}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-w-[60px] ${mood === option.value
                                        ? 'bg-primary/10 ring-2 ring-primary text-primary'
                                        : 'text-stone-400 hover:bg-stone-50 hover:text-stone-600'
                                        }`}
                                >
                                    <option.icon className="w-8 h-8" />
                                    <span className="text-xs font-medium">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Medical Conditions */}
                    <div className="space-y-3 bg-red-50/50 p-4 rounded-xl border border-red-100">
                        <label className="text-sm font-medium text-red-900 flex justify-between items-center">
                            <span>Medical Symptoms (Optional)</span>
                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Private</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {medicalConditionOptions.map((condition) => (
                                <div key={condition} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={condition}
                                        checked={conditions.includes(condition)}
                                        onCheckedChange={() => handleConditionToggle(condition)}
                                    />
                                    <Label htmlFor={condition} className="text-sm cursor-pointer text-stone-600 font-normal">
                                        {condition}
                                    </Label>
                                </div>
                            ))}
                            <div className="flex items-center space-x-2 col-span-2">
                                <Checkbox
                                    id="other"
                                    checked={isOtherChecked}
                                    onCheckedChange={(c) => setIsOtherChecked(!!c)}
                                />
                                <Label htmlFor="other" className="text-sm cursor-pointer text-stone-600 font-normal whitespace-nowrap">
                                    Other:
                                </Label>
                                <Input
                                    className="h-8 text-sm"
                                    placeholder="Specify..."
                                    value={otherCondition}
                                    onChange={(e) => setOtherCondition(e.target.value)}
                                    disabled={!isOtherChecked}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-stone-400 italic">
                            * Information is for personal tracking only and is not a medical diagnosis.
                        </p>
                    </div>

                    {/* Text Note */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-600">Write your thoughts...</label>
                        <Textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Dear diary, today was..."
                            className="min-h-[120px] resize-none bg-stone-50 border-stone-200 focus:border-primary"
                        />
                    </div>

                    {/* Milestone Section */}
                    <div className="space-y-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                                <span>⭐ Mark this day as a Milestone</span>
                            </label>
                            <Checkbox
                                checked={isMilestone}
                                onCheckedChange={(c) => setIsMilestone(!!c)}
                                className="border-amber-400 data-[state=checked]:bg-amber-500"
                            />
                        </div>

                        {isMilestone && (
                            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <Label className="text-xs text-amber-700">Milestone Title *</Label>
                                    <Input
                                        placeholder="e.g. My Baby's First Smile"
                                        value={milestoneTitle}
                                        onChange={(e) => setMilestoneTitle(e.target.value)}
                                        className="bg-white border-amber-200 focus-visible:ring-amber-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-amber-700">Category *</Label>
                                    <select
                                        className="w-full h-10 px-3 py-2 rounded-md border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        value={isCustomCategory ? 'other' : milestoneCategory}
                                        onChange={(e) => {
                                            if (e.target.value === 'other') {
                                                setIsCustomCategory(true);
                                                setMilestoneCategory('');
                                            } else {
                                                setIsCustomCategory(false);
                                                setMilestoneCategory(e.target.value);
                                            }
                                        }}
                                    >
                                        <option value="">Select a category...</option>
                                        {Object.entries(milestoneCategories).map(([group, options]) => (
                                            <optgroup key={group} label={group}>
                                                {options.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                        <option value="other">Other / Custom</option>
                                    </select>

                                    {isCustomCategory && (
                                        <Input
                                            placeholder="Enter custom category..."
                                            value={customCategory}
                                            onChange={(e) => setCustomCategory(e.target.value)}
                                            className="mt-2 bg-white border-amber-200"
                                        />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-amber-700">Optional Description</Label>
                                    <Textarea
                                        placeholder="Add more details about this special moment..."
                                        value={milestoneDescription}
                                        onChange={(e) => setMilestoneDescription(e.target.value)}
                                        className="bg-white border-amber-200 focus-visible:ring-amber-500 min-h-[80px]"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-600 flex justify-between">
                            <span>Memories</span>
                            <span className="text-xs text-stone-400">{images.length}/3</span>
                        </label>

                        <div className="flex gap-2 flex-wrap">
                            {images.map((url, idx) => (
                                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-200 group">
                                    <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            {images.length < 3 && (
                                <label className={`
                                    w-20 h-20 rounded-lg border-2 border-dashed border-stone-200 
                                    flex flex-col items-center justify-center text-stone-400 
                                    hover:border-primary/50 hover:text-primary/50 cursor-pointer transition-colors
                                    ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                                `}>
                                    {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImagePlus className="w-6 h-6" />}
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            )}
                        </div>
                        <p className="text-xs text-stone-400">Max 3MB per image. Jpeg/Png only.</p>
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:justify-between">
                    {existingEntry ? (
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loading}
                            className="mr-auto"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    ) : (
                        <div />
                    )}
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading || uploading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Memory
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddEditDiaryModal;
