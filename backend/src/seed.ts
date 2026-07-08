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
import fs from 'fs';
import path from 'path';

let MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carbonmarket';

try {
  const localUriPath = path.join(__dirname, '../.mongo_uri');
  if (fs.existsSync(localUriPath)) {
    MONGO_URI = fs.readFileSync(localUriPath, 'utf8');
    console.log('Using local in-memory MongoDB URI from backend process...');
  }
} catch (err) {}

export async function seedDatabase(skipConnection = false) {
  try {
    if (!skipConnection && mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGO_URI);
      console.log('Connected to MongoDB for seeding...');
    }

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

    // 1. Create Users (NGOs, Verifiers, Buyers)
    const farmerUsers = await User.insertMany([
      { name: 'John Deere', email: 'john@farm.com', passwordHash, role: 'ngo', phone: '1234567890' },
      { name: 'Sarah Fields', email: 'sarah@fields.org', passwordHash, role: 'ngo', phone: '0987654321' },
      { name: 'Green Earth NGO', email: 'contact@greenearth.org', passwordHash, role: 'ngo', phone: '1122334455' }
    ]);

    const verifierUser = await User.create({
      name: 'Global Verifiers Inc.',
      email: 'verify@global.org',
      passwordHash,
      role: 'verifier'
    });

    const buyerUsers = await User.insertMany([
      { name: 'TechCorp Industries', email: 'sustainability@techcorp.com', passwordHash, role: 'buyer' },
      { name: 'EcoFriendly Goods', email: 'hello@ecofriendly.com', passwordHash, role: 'buyer' }
    ]);

    // Create Actual Farmer Users (for login)
    const realFarmers = await User.insertMany([
      { name: 'Amit Patil', email: 'amit@farmer.com', passwordHash, role: 'farmer', phone: '9876543210' },
      { name: 'Ramesh Singh', email: 'ramesh@farmer.com', passwordHash, role: 'farmer', phone: '8765432109' },
      { name: 'Suresh Kumar', email: 'suresh@farmer.com', passwordHash, role: 'farmer', phone: '7654321098' },
      { name: 'Vijay Jadhav', email: 'vijay@farmer.com', passwordHash, role: 'farmer', phone: '6543210987' }
    ]);

    // 2. Create NGO Profile
    const ngoProfile = await require('./models/NgoProfile').default.create({
      userId: farmerUsers[0]._id,
      organizationName: 'Global Earth NGO',
      contactPerson: 'Jane Doe',
      region: 'Global'
    });

    // 3. Create Farmers
    const farmers = await Farmer.insertMany([
      { userId: realFarmers[0]._id, ngoId: ngoProfile._id, name: 'Amit Patil', phone: '9876543210', village: 'Kolhapur', investmentAmount: 50000 },
      { userId: realFarmers[1]._id, ngoId: ngoProfile._id, name: 'Ramesh Singh', phone: '8765432109', village: 'Sangli', investmentAmount: 25000 },
      { userId: realFarmers[2]._id, ngoId: ngoProfile._id, name: 'Suresh Kumar', phone: '7654321098', village: 'Satara', investmentAmount: 75000 },
      { userId: realFarmers[3]._id, ngoId: ngoProfile._id, name: 'Vijay Jadhav', phone: '6543210987', village: 'Pune Rural', investmentAmount: 40000 }
    ]);

    // 4. Create Land Parcels
    const lands = await Land.insertMany([
      {
        farmerId: farmers[0]._id,
        area: 15,
        location: 'Kolhapur East',
        coordinates: [[16.7050, 74.2433], [16.7050, 74.2450], [16.7070, 74.2450], [16.7070, 74.2433]],
        treeType: 'Teak',
        soilType: 'Black Cotton',
        status: 'Verified'
      },
      {
        farmerId: farmers[1]._id,
        area: 5,
        location: 'Sangli Outskirts',
        coordinates: [[16.8524, 74.5815]],
        treeType: 'Mango & Neem',
        soilType: 'Alluvial',
        status: 'Pending Verification'
      },
      {
        farmerId: farmers[2]._id,
        area: 25,
        location: 'Satara Hills',
        coordinates: [[17.6805, 74.0183]],
        treeType: 'Bamboo',
        soilType: 'Laterite',
        status: 'Processing'
      },
      {
        farmerId: farmers[3]._id,
        area: 10,
        location: 'Pune Rural',
        coordinates: [[18.5204, 73.8567]],
        treeType: 'Banyan',
        soilType: 'Red Soil',
        status: 'Verified'
      }
    ]);

    // 5. Create Documents
    await Document.insertMany([
      // Farmer 1 (Verified)
      { farmerId: farmers[0]._id, type: 'Identity Proof', fileUrl: 'https://example.com/fake-aadhaar-1.pdf', verificationStatus: 'Verified' },
      { farmerId: farmers[0]._id, type: '7/12 Extract', fileUrl: 'https://example.com/fake-712-extract-1.pdf', verificationStatus: 'Verified' },
      { farmerId: farmers[0]._id, type: 'Proof of Ownership', fileUrl: 'https://example.com/fake-ownership-1.pdf', verificationStatus: 'Verified' },
      
      // Farmer 2 (Pending)
      { farmerId: farmers[1]._id, type: 'Identity Proof', fileUrl: 'https://example.com/fake-aadhaar-2.pdf', verificationStatus: 'Pending' },
      { farmerId: farmers[1]._id, type: '7/12 Extract', fileUrl: 'https://example.com/fake-712-extract-2.pdf', verificationStatus: 'Pending' },
      { farmerId: farmers[1]._id, type: 'Proof of Ownership', fileUrl: 'https://example.com/fake-ownership-2.pdf', verificationStatus: 'Pending' },
      
      // Farmer 3 (Processing)
      { farmerId: farmers[2]._id, type: 'Identity Proof', fileUrl: 'https://example.com/fake-aadhaar-3.pdf', verificationStatus: 'Verified' },
      { farmerId: farmers[2]._id, type: '7/12 Extract', fileUrl: 'https://example.com/fake-712-extract-3.pdf', verificationStatus: 'Verified' },
      { farmerId: farmers[2]._id, type: 'Proof of Ownership', fileUrl: 'https://example.com/fake-ownership-3.pdf', verificationStatus: 'Verified' },
      
      // Farmer 4 (Verified)
      { farmerId: farmers[3]._id, type: 'Identity Proof', fileUrl: 'https://example.com/fake-aadhaar-4.pdf', verificationStatus: 'Verified' },
      { farmerId: farmers[3]._id, type: '7/12 Extract', fileUrl: 'https://example.com/fake-712-extract-4.pdf', verificationStatus: 'Verified' },
      { farmerId: farmers[3]._id, type: 'Proof of Ownership', fileUrl: 'https://example.com/fake-ownership-4.pdf', verificationStatus: 'Verified' },
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

    // 8. Create a completed Transaction & Certificate
    const soldCredit = await CarbonCredit.create({
      landId: lands[0]._id,
      tonsCO2: 500,
      pricePerTon: 25,
      owner: buyerUsers[0]._id,
      available: false
    });

    const transaction = await Transaction.create({
      creditId: soldCredit._id,
      buyerId: buyerUsers[0]._id,
      farmerId: realFarmers[0]._id,
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
    if (!skipConnection) process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    if (!skipConnection) process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}
