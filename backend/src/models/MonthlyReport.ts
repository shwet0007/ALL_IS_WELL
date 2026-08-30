import mongoose, { Schema, Document } from 'mongoose';

export interface IMonthlyReport extends Document {
    userId: string;
    month: string; // YYYY-MM
    consistencyScore: number;
    metrics: {
        checkupCompletion: number;
        routineAdherence: number;
        vaccinationTimeliness: number;
        sleepRegularity: number;
    };
    highlights: string[];
    attentionAreas: string[];
    createdAt: Date;
}

const MonthlyReportSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    month: { type: String, required: true },
    consistencyScore: { type: Number, required: true },
    metrics: {
        checkupCompletion: { type: Number, required: true },
        routineAdherence: { type: Number, required: true },
        vaccinationTimeliness: { type: Number, required: true },
        sleepRegularity: { type: Number, required: true }
    },
    highlights: [{ type: String }],
    attentionAreas: [{ type: String }]
}, {
    timestamps: true
});

MonthlyReportSchema.index({ userId: 1, month: 1 }, { unique: true });

export default mongoose.model<IMonthlyReport>('MonthlyReport', MonthlyReportSchema);
