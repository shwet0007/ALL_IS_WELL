import mongoose, { Schema, Document } from 'mongoose';

export interface IVaccination extends Document {
    userId: string;
    vaccineName: string;
    dueDate: Date;
    completedDate?: Date;
    status: 'scheduled' | 'completed' | 'missed' | 'rescheduled';
    notes?: string;
    babyAge?: string; // e.g., "6 weeks", "9 months"
}

const VaccinationSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    vaccineName: { type: String, required: true },
    dueDate: { type: Date, required: true },
    completedDate: { type: Date },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'missed', 'rescheduled'],
        default: 'scheduled'
    },
    notes: { type: String },
    babyAge: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<IVaccination>('Vaccination', VaccinationSchema);
