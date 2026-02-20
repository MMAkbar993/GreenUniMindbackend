import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greenunimind');
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

export { connectDB };
