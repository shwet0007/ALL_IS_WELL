import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
    userId: string;
    type: 'Consistency Champion' | 'Care Leader' | 'Safety Conscious' | 'Hydration Hero' | 'Baby Comfort Star';
    level: number;
    dateEarned: Date;
    description: string;
    icon: string;
}

const AchievementSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    type: {
        type: String,
        required: true,
        enum: ['Consistency Champion', 'Care Leader', 'Safety Conscious', 'Hydration Hero', 'Baby Comfort Star']
    },
    level: { type: Number, default: 1 },
    dateEarned: { type: Date, default: Date.now },
    description: { type: String },
    icon: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
