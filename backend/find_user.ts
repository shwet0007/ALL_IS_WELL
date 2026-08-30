import mongoose from 'mongoose';
import { config } from './src/config/env';
import User from './src/models/User';

const findUser = async () => {
    try {
        await mongoose.connect(config.mongoUri);

        // Fuzzy search for Nikita
        const users = await User.find({
            $or: [
                { name: { $regex: 'Nikita', $options: 'i' } },
                { email: { $regex: 'nikita', $options: 'i' } }
            ]
        });

        console.log("Found users:", JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

findUser();
