import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Hardcoded Atlas URI as fallback so Render always has it even without .env
const ATLAS_URI = 'mongodb+srv://20kidzzz26_db_user:CLtsOCODXpNCvVMP@cluster0.v5cleb2.mongodb.net/?appName=Cluster0';
const MONGO_URI = process.env.MONGO_URI || ATLAS_URI;

const connectDB = async () => {
  // First try Atlas (real database)
  const urisToTry = [MONGO_URI];
  // If MONGO_URI is not Atlas URI, also try the hardcoded one
  if (MONGO_URI !== ATLAS_URI) {
    urisToTry.push(ATLAS_URI);
  }

  for (const uri of urisToTry) {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      console.log(`MongoDB Connected: ${conn.connection.host}`);

      // Check if database needs seeding
      const User = require('../models/User').default || require('../models/User');
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('Database is empty. Seeding...');
        const { seedDatabase } = await import('../seed');
        await seedDatabase(true);
      } else {
        console.log(`Database already has ${userCount} users. Skipping seed.`);
      }
      return; // Success - stop trying
    } catch (error: any) {
      console.log(`Connection failed for URI attempt: ${error.message}`);
    }
  }

  // All Atlas attempts failed - fall back to in-memory
  console.log('All Atlas connections failed. Falling back to local in-memory database...');
  try {
    const mongoServer = await MongoMemoryServer.create({
      instance: {
        args: [
          '--wiredTigerCacheSizeGB=0.25',
          '--nojournal'
        ]
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
};

export default connectDB;
