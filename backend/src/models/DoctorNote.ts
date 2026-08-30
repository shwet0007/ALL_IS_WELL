import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorNote extends Document {
    patientId: string;
    date: string; // ISO string
    content: string;
    doctorName: string;
    priority: 'normal' | 'high';
    createdAt: Date;
    updatedAt: Date;
}

const DoctorNoteSchema: Schema = new Schema({
    patientId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    content: { type: String, required: true },
    doctorName: { type: String, required: true },
    priority: { type: String, enum: ['normal', 'high'], default: 'normal' }
}, {
    timestamps: true
});

export default mongoose.model<IDoctorNote>('DoctorNote', DoctorNoteSchema);
