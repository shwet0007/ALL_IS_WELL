import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
    userId: string;
    title: string;
    time: string;
    type: 'feeding' | 'sleep' | 'medication' | 'checkup' | 'vaccination' | 'other';
    completed: boolean;
    date?: string;
    note?: string;
    babyMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ScheduleSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    time: { type: String, required: true },
    type: {
        type: String,
        enum: ['feeding', 'sleep', 'medication', 'checkup', 'vaccination', 'other'],
        required: true
    },
    completed: { type: Boolean, default: false },
    date: { type: String },
    note: { type: String },
    babyMessage: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema);
