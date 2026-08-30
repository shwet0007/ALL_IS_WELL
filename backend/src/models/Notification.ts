import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    userId: string;
    title: string;
    message?: string; // babyMessage
    sourceType: 'schedule' | 'doctor' | 'vaccine' | 'medicine' | 'system';
    sourceId: string;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String },
    sourceType: {
        type: String,
        enum: ['schedule', 'doctor', 'vaccine', 'medicine', 'system'],
        required: true
    },
    sourceId: { type: String, required: true },
    isRead: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Index for fetching user's notifications sorted by time
NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
