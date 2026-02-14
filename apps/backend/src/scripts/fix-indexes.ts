import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixIndexes = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('MONGODB_URI not defined');
      return;
    }

    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Drop the problematic indexes
    const db = mongoose.connection.db;
    
    try {
      await db.collection('riderequests').dropIndex('fromLocation_2dsphere');
      console.log('✅ Dropped riderequests fromLocation_2dsphere index');
    } catch (e) {
      console.log('ℹ️ Index fromLocation_2dsphere not found or already dropped');
    }
    
    try {
      await db.collection('riderequests').dropIndex('toLocation_2dsphere');
      console.log('✅ Dropped riderequests toLocation_2dsphere index');
    } catch (e) {
      console.log('ℹ️ Index toLocation_2dsphere not found or already dropped');
    }
    
    try {
      await db.collection('rideoffers').dropIndex('fromLocation_2dsphere');
      console.log('✅ Dropped rideoffers fromLocation_2dsphere index');
    } catch (e) {
      console.log('ℹ️ Index fromLocation_2dsphere not found or already dropped');
    }
    
    try {
      await db.collection('rideoffers').dropIndex('toLocation_2dsphere');
      console.log('✅ Dropped rideoffers toLocation_2dsphere index');
    } catch (e) {
      console.log('ℹ️ Index toLocation_2dsphere not found or already dropped');
    }

    console.log('\n✅ All geospatial indexes removed!');
    console.log('You can now run: npm run test:db');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

fixIndexes();
