import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorRequest extends Document {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    status: 'pending' | 'accepted' | 'rejected';
    requestDate: Date;
    responseDate?: Date;
}

const DoctorRequestSchema: Schema = new Schema({
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    requestDate: { type: Date, default: Date.now },
    responseDate: { type: Date }
}, {
    timestamps: true
});

export default mongoose.model<IDoctorRequest>('DoctorRequest', DoctorRequestSchema);
