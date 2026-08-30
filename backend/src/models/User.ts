import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    firebase_uid: string;
    name: string;
    email: string;
    role: 'pregnant' | 'mother' | 'doctor';
    language: string;
    age?: string;
    height?: string;
    weight?: string;
    bloodGroup?: string;
    emergencyContact: {
        name: string;
        phone: string;
    };
    medicalConditions?: {
        diabetes: boolean;
        bp: boolean;
        thyroid: boolean;
        anemia: boolean;
        asthma: boolean;
        other?: string;
    };
    joinCode?: string;
    assignedDoctorId?: string;
    pregnancyStartDate?: string;
    trimester?: string;
    previousComplications?: string;
    highRisk?: boolean;
    babyDob?: string;
    babyName?: string;
    babyGender?: string;
    babyBloodGroup?: string;
    deliveryType?: 'normal' | 'c-section';
    birthWeight?: string;
    premature?: boolean;
    feedingPreference?: 'breast' | 'formula' | 'mixed';
    babyAllergies?: string;
    babyHealthConditions?: string;
    pediatricianName?: string;
    pediatricianContact?: string;
    specialization?: string;
    clinicName?: string;
    lifestyle?: {
        sleep?: 'good' | 'average' | 'poor';
        activity?: 'low' | 'medium' | 'high';
        diet?: 'veg' | 'non-veg' | 'mixed';
        allergies?: string;
    };
    dietPreferences?: {
        mother?: {
            dietType: 'veg' | 'non-veg' | 'eggetarian' | 'vegan';
            restrictions: string[];
            allergies: string[];
            mealPattern: string;
            waterIntake: string;
        };
        baby?: {
            feedingType: 'breast' | 'formula' | 'mixed';
            allergies: string[];
            solidFoodStarted: boolean;
            weaningStyle?: 'traditional' | 'blw';
        };
    };
    doctorRoomId?: string;
    doctorId?: string;
    doctorName?: string;
    fcmToken?: string;
    timezone?: string;
    profileCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    firebase_uid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    role: { type: String, enum: ['pregnant', 'mother', 'doctor'], required: true },
    language: { type: String, required: true },
    age: { type: String },
    height: { type: String },
    weight: { type: String },
    bloodGroup: { type: String },
    emergencyContact: {
        name: { type: String, required: true },
        phone: { type: String, required: true }
    },
    medicalConditions: {
        diabetes: { type: Boolean, default: false },
        bp: { type: Boolean, default: false },
        thyroid: { type: Boolean, default: false },
        anemia: { type: Boolean, default: false },
        asthma: { type: Boolean, default: false },
        other: { type: String }
    },
    joinCode: { type: String },
    assignedDoctorId: { type: String }, // Referencing firebase_uid
    pregnancyStartDate: { type: String },
    trimester: { type: String },
    previousComplications: { type: String },
    highRisk: { type: Boolean },
    babyDob: { type: String },
    babyName: { type: String },
    babyGender: { type: String },
    babyBloodGroup: { type: String },
    deliveryType: { type: String, enum: ['normal', 'c-section'] },
    birthWeight: { type: String },
    premature: { type: Boolean },
    feedingPreference: { type: String, enum: ['breast', 'formula', 'mixed'] },
    babyAllergies: { type: String },
    babyHealthConditions: { type: String },
    pediatricianName: { type: String },
    pediatricianContact: { type: String },
    specialization: { type: String },
    clinicName: { type: String },
    lifestyle: {
        sleep: { type: String, enum: ['good', 'average', 'poor'] },
        activity: { type: String, enum: ['low', 'medium', 'high'] },
        diet: { type: String, enum: ['veg', 'non-veg', 'mixed'] },
        allergies: { type: String }
    },
    dietPreferences: {
        mother: {
            dietType: { type: String, enum: ['veg', 'non-veg', 'eggetarian', 'vegan'] },
            restrictions: [{ type: String }],
            allergies: [{ type: String }],
            mealPattern: { type: String },
            waterIntake: { type: String }
        },
        baby: {
            feedingType: { type: String, enum: ['breast', 'formula', 'mixed'] },
            allergies: [{ type: String }],
            solidFoodStarted: { type: Boolean },
            weaningStyle: { type: String, enum: ['traditional', 'blw'] }
        }
    },
    doctorRoomId: { type: String },
    doctorId: { type: String },
    doctorName: { type: String },
    fcmToken: { type: String },
    timezone: { type: String, default: 'UTC' },
    profileCompleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
