import mongoose, { Schema, Document } from 'mongoose';

export interface ICheckup extends Document {
    patientId: string;
    date: string; // ISO string
    type: 'pregnancy' | 'baby';
    note?: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
    isUrgent?: boolean;
    scheduledBy: string; // Doctor ID (firebase_uid)
    patientName: string;
    createdAt: Date;
    updatedAt: Date;
}

const CheckupSchema: Schema = new Schema({
    patientId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    type: { type: String, enum: ['pregnancy', 'baby'], required: true },
    note: { type: String },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'pending'],
        default: 'scheduled'
    },
    isUrgent: { type: Boolean, default: false },
    scheduledBy: { type: String, required: true },
    patientName: { type: String, required: true }
}, {
    timestamps: true
});

export default mongoose.model<ICheckup>('Checkup', CheckupSchema);
