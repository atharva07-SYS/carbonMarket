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
    
    // Check if database needs seeding
    const User = require('../models/User').default || require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Atlas database is empty. Seeding...');
      const { seedDatabase } = await import('../seed');
      await seedDatabase(true);
    }
  } catch (error: any) {
    console.log(`Atlas connection failed (${error.message}).`);
    console.log(`Falling back to local in-memory database to bypass network restrictions...`);
    try {
      const mongoServer = await MongoMemoryServer.create({
        instance: {
          args: [
            '--wiredTigerCacheSizeGB=0.25',
            '--nojournal'
          ] // Minimum allowed is 256MB, disable journaling to save RAM
        }
      });
      const memUri = mongoServer.getUri();
      
      // Save URI so other scripts (like seed.ts) can connect to this same memory DB
      fs.writeFileSync(path.join(__dirname, '../../.mongo_uri'), memUri);
      
      await mongoose.connect(memUri);
      console.log(`✅ MongoDB Connected to Local Memory Server!`);
      
      // Automatically seed the empty memory database
      const { seedDatabase } = await import('../seed');
      await seedDatabase(true);
    } catch (memError: any) {
      console.error(`Error starting memory server: ${memError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
