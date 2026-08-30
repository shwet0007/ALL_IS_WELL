import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
    userId: string;
    sourceType: 'schedule' | 'doctor' | 'vaccine' | 'medicine';
    sourceId: string;
    title: string;
    time: string;
    date: string; // YYYY-MM-DD
    babyMessage?: string;
    sent: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReminderSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    sourceType: {
        type: String,
        enum: ['schedule', 'doctor', 'vaccine', 'medicine'],
        required: true
    },
    sourceId: { type: String, required: true },
    title: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: String, required: true, index: true },
    babyMessage: { type: String },
    sent: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Ensure unique reminders for same source, user, and specific date
ReminderSchema.index({ userId: 1, sourceId: 1, sourceType: 1, date: 1 }, { unique: true });

export default mongoose.model<IReminder>('Reminder', ReminderSchema);
