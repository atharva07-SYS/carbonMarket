import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User';
import Farmer from './models/Farmer';
import Land from './models/Land';
import Document from './models/Document';
import Verification from './models/Verification';
import CarbonCredit from './models/CarbonCredit';
import Marketplace from './models/Marketplace';
import Transaction from './models/Transaction';
import Certificate from './models/Certificate';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carbonmarket';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Farmer.deleteMany({});
    await Land.deleteMany({});
    await Document.deleteMany({});
    await Verification.deleteMany({});
    await CarbonCredit.deleteMany({});
    await Marketplace.deleteMany({});
    await Transaction.deleteMany({});
    await Certificate.deleteMany({});

    console.log('Collections cleared.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Create Users (Farmers, Verifiers, Buyers)
    const farmerUsers = await User.insertMany([
      { name: 'John Deere', email: 'john@farm.com', passwordHash, role: 'farmer', phone: '1234567890' },
      { name: 'Sarah Fields', email: 'sarah@fields.org', passwordHash, role: 'farmer', phone: '0987654321' },
      { name: 'Green Earth NGO', email: 'contact@greenearth.org', passwordHash, role: 'farmer', phone: '1122334455' }
    ]);

    const verifierUser = await User.create({
      name: 'Global Verifiers Inc.',
      email: 'verify@global.org',
      passwordHash,
      role: 'verifier'
    });

    const buyerUser = await User.create({
      name: 'TechCorp Industries',
      email: 'sustainability@techcorp.com',
      passwordHash,
      role: 'buyer'
    });

    // 2. Create Farmers
    const farmers = await Farmer.insertMany([
      { userId: farmerUsers[0]._id, name: 'John Deere', organization: 'Deere Farms', region: 'Midwest USA' },
      { userId: farmerUsers[1]._id, name: 'Sarah Fields', organization: 'Fields Co-op', region: 'California' },
      { userId: farmerUsers[2]._id, name: 'Green Earth NGO', organization: 'Green Earth', region: 'Amazon, Brazil' }
    ]);

    // 3. Create Land Parcels
    const lands = await Land.insertMany([
      {
        farmerId: farmers[0]._id,
        area: 150,
        location: 'Iowa, USA',
        coordinates: [[41.8780, -93.0977], [41.8780, -93.1000], [41.8800, -93.1000], [41.8800, -93.0977]],
        treeType: 'Oak and Pine',
        soilType: 'Loam',
        status: 'Verified'
      },
      {
        farmerId: farmers[1]._id,
        area: 50,
        location: 'Napa Valley, CA',
        coordinates: [[38.2975, -122.2868]],
        treeType: 'Redwood',
        soilType: 'Clay',
        status: 'Pending Verification'
      },
      {
        farmerId: farmers[2]._id,
        area: 5000,
        location: 'Amazon Rainforest',
        coordinates: [[-3.4653, -62.2159]],
        treeType: 'Mixed Tropical',
        soilType: 'Tropical Forest Soil',
        status: 'Processing'
      }
    ]);

    // 4. Create Documents
    await Document.insertMany([
      { farmerId: farmers[0]._id, type: 'Land Ownership Proof', fileUrl: '/uploads/demo-deed.pdf', verificationStatus: 'Verified' },
      { farmerId: farmers[0]._id, type: 'Soil Carbon Report', fileUrl: '/uploads/demo-soil.pdf', verificationStatus: 'Verified' },
      { farmerId: farmers[1]._id, type: 'Land Ownership Proof', fileUrl: '/uploads/demo-deed2.pdf', verificationStatus: 'Pending' }
    ]);

    // 5. Create Verification for Verified Land
    await Verification.create({
      landId: lands[0]._id,
      ocrData: { soilCarbonPercentage: 4.5, confidence: 0.92 },
      ndviValue: 0.78,
      satelliteChecked: true,
      trustScore: 95,
      carbonEstimated: 1250, // tons
      verifierReviewed: true,
      reviewedBy: verifierUser._id,
      decision: 'Approved'
    });

    // 6. Create Carbon Credits & Marketplace Listing
    const credit = await CarbonCredit.create({
      landId: lands[0]._id,
      tonsCO2: 1250,
      pricePerTon: 25,
      owner: farmerUsers[0]._id,
      available: true
    });

    await Marketplace.create({
      creditId: credit._id,
      active: true
    });

    // 7. Create a completed Transaction & Certificate
    const soldCredit = await CarbonCredit.create({
      landId: lands[0]._id,
      tonsCO2: 500,
      pricePerTon: 25,
      owner: buyerUser._id,
      available: false
    });

    const transaction = await Transaction.create({
      creditId: soldCredit._id,
      buyerId: buyerUser._id,
      farmerId: farmerUsers[0]._id,
      amount: 12500,
      date: new Date()
    });

    await Certificate.create({
      transactionId: transaction._id,
      projectId: lands[0]._id,
      pdfUrl: '/uploads/demo-cert.pdf',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    });

    console.log('Seed data successfully inserted!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
