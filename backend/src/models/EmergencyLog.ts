import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergencyLog extends Document {
    userId: string;
    timestamp: Date;
    contactCalled: string;
    contactPhone: string;
    location?: string;
    resolved: boolean;
}

const EmergencyLogSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, required: true },
    contactCalled: { type: String, required: true },
    contactPhone: { type: String, required: true },
    location: { type: String },
    resolved: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default mongoose.model<IEmergencyLog>('EmergencyLog', EmergencyLogSchema);
