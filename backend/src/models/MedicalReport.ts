import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalReport extends Document {
    patientId: string;
    date: string; // ISO string
    fileName: string;
    fileUrl: string;
    doctorName: string;
    remarks?: string;
    createdAt: Date;
    updatedAt: Date;
}

const MedicalReportSchema: Schema = new Schema({
    patientId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    doctorName: { type: String, required: true },
    remarks: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<IMedicalReport>('MedicalReport', MedicalReportSchema);
