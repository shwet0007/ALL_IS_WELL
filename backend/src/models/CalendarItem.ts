import mongoose, { Schema, Document } from 'mongoose';

export interface ICalendarItem extends Document {
    userId: string;
    date: string; // YYYY-MM-DD
    category: 'Note' | 'Health' | 'Baby Care';
    title: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CalendarItemSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    category: { type: String, enum: ['Note', 'Health', 'Baby Care'], required: true },
    title: { type: String, required: true },
    description: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<ICalendarItem>('CalendarItem', CalendarItemSchema);
