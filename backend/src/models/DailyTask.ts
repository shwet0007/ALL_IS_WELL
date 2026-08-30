import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyTask extends Document {
    userId: string;
    date: string; // YYYY-MM-DD
    task: string;
    status: 'pending' | 'completed' | 'skipped';
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DailyTaskSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    task: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'skipped'], default: 'pending' },
    note: { type: String }
}, {
    timestamps: true
});

// Compound index to ensure one task per user per day
DailyTaskSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IDailyTask>('DailyTask', DailyTaskSchema);
