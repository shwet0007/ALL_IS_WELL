import mongoose from 'mongoose';
import { config } from './src/config/env';
import User from './src/models/User';

const checkDb = async () => {
    try {
        console.log("Connecting to:", config.mongoUri);
        await mongoose.connect(config.mongoUri);
        console.log("Connected.");

        const count = await User.countDocuments();
        console.log(`User count: ${count}`);

        if (count > 0) {
            const users = await User.find({}, 'name email role firebase_uid').limit(5);
            console.log("Sample users:", users);
        } else {
            console.log("No users found.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkDb();
