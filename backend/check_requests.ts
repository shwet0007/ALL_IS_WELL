import mongoose from 'mongoose';
import { config } from './src/config/env';
import DoctorRequest from './src/models/DoctorRequest';

const checkRequests = async () => {
    try {
        await mongoose.connect(config.mongoUri);

        const requests = await DoctorRequest.find({});
        console.log("All Doctor Requests:", JSON.stringify(requests, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkRequests();
