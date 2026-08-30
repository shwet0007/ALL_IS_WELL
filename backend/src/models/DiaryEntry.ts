import mongoose, { Schema, Document } from 'mongoose';

export interface IDiaryEntry extends Document {
    userId: string; // Firebase UID
    date: string; // Format: YYYY-MM-DD
    mood: string;
    text?: string;
    imageUrls: string[];
    medicalConditions: string[];
    isMilestone: boolean;
    milestoneTitle?: string;
    milestoneCategory?: string;
    milestoneDescription?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DiaryEntrySchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    mood: { type: String, required: true },
    text: { type: String },
    imageUrls: [{ type: String }],
    medicalConditions: [{ type: String }],
    isMilestone: { type: Boolean, default: false },
    milestoneTitle: { type: String },
    milestoneCategory: { type: String },
    milestoneDescription: { type: String }
}, {
    timestamps: true
});

// Enforce unique entry per user per day
DiaryEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IDiaryEntry>('DiaryEntry', DiaryEntrySchema);
