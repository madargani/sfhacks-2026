import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};
