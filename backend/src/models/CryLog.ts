import mongoose, { Schema, Document } from 'mongoose';

export interface ICryLog extends Document {
    userId: string;
    pattern: string;
    confidence: number;
    timestamp: Date;
}

const CryLogSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    pattern: { type: String, required: true },
    confidence: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export default mongoose.model<ICryLog>('CryLog', CryLogSchema);
