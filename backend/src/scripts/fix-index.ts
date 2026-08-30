
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('reminders');
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes);

        const indexName = 'userId_1_sourceId_1_sourceType_1';
        const indexExists = indexes.some(idx => idx.name === indexName);

        if (indexExists) {
            await collection.dropIndex(indexName);
            console.log(`Dropped index: ${indexName}`);
        } else {
            console.log(`Index ${indexName} not found.`);
        }

        // List updated indexes
        const updatedIndexes = await collection.indexes();
        console.log('Updated indexes:', updatedIndexes);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

dropIndex();
