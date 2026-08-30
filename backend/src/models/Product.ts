import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    imageUrl: string;
    category: 'baby' | 'pregnancy' | 'medicine' | 'clothing' | 'hygiene';
    price?: string;
    isSponsored: boolean;
    companyName?: string;
    externalLink?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: {
        type: String,
        enum: ['baby', 'pregnancy', 'medicine', 'clothing', 'hygiene'],
        required: true,
        index: true
    },
    price: { type: String }, // Display only, e.g., "$25.00"
    isSponsored: { type: Boolean, default: false },
    companyName: { type: String },
    externalLink: { type: String },
}, {
    timestamps: true
});

export default mongoose.model<IProduct>('Product', ProductSchema);
