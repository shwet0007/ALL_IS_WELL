import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyCheckup extends Document {
    userId: string;
    role: 'pregnant' | 'mother';
    date: string; // YYYY-MM-DD
    responses: {
        physical: string;
        mental: string;
        lifestyle: string;
        babyRelated?: string;
    };
    createdAt: Date;
}

const DailyCheckupSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    role: { type: String, enum: ['pregnant', 'mother'], required: true },
    date: { type: String, required: true },
    responses: {
        physical: { type: String, required: true },
        mental: { type: String, required: true },
        lifestyle: { type: String, required: true },
        babyRelated: { type: String }
    }
}, {
    timestamps: true
});

// Ensure one checkup per user per day
DailyCheckupSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IDailyCheckup>('DailyCheckup', DailyCheckupSchema);
