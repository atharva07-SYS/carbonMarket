import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carbonmarket';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.log(`Atlas connection failed (${error.message}).`);
    console.log(`Falling back to local in-memory database to bypass network restrictions...`);
    try {
      const mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();
      
      // Save URI so other scripts (like seed.ts) can connect to this same memory DB
      fs.writeFileSync(path.join(__dirname, '../../.mongo_uri'), memUri);
      
      await mongoose.connect(memUri);
      console.log(`✅ MongoDB Connected to Local Memory Server!`);
    } catch (memError: any) {
      console.error(`Error starting memory server: ${memError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
