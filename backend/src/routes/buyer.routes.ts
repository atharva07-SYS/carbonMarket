import express from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middlewares/auth.middleware';
import CarbonCredit from '../models/CarbonCredit';
import Marketplace from '../models/Marketplace';
import Transaction from '../models/Transaction';
import Certificate from '../models/Certificate';
import BuyerProfile from '../models/BuyerProfile';
import crypto from 'crypto';

const router = express.Router();

// Publicly browsable marketplace
router.get('/marketplace', async (req: any, res: any) => {
  try {
    // Return all active marketplace listings populated with credit and land details
    const listings = await Marketplace.find({ active: true })
      .populate({
        path: 'creditId',
        populate: { path: 'landId' }
      });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Submit Buyer Verification (KYC)
router.post('/verify', authenticate, async (req: any, res: any) => {
  try {
    const { companyName, panDetails } = req.body;
    let profile = await BuyerProfile.findOne({ userId: req.user._id });
    
    if (profile) {
      profile.companyName = companyName;
      profile.panDetails = panDetails;
      profile.status = 'Pending';
      await profile.save();
    } else {
      profile = await BuyerProfile.create({
        userId: req.user._id,
        companyName,
        panDetails,
        status: 'Pending'
      });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Check Verification Status
router.get('/status', authenticate, async (req: any, res: any) => {
  try {
    const profile = await BuyerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.json({ status: 'Not Submitted' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Protected purchase route
router.post('/purchase/:creditId', authenticate, async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const creditId = req.params.creditId;
    
    // Check KYC
    const buyerProfile = await BuyerProfile.findOne({ userId: req.user._id }).session(session);
    if (!buyerProfile || buyerProfile.status !== 'Verified') {
      throw new Error('Your account is not verified for purchases. Please submit KYC details.');
    }

    const credit = await CarbonCredit.findById(creditId).session(session);

    if (!credit) throw new Error('Credit not found');
    if (!credit.available) throw new Error('Credit is no longer available');

    // 1. Mark credit as unavailable and change owner
    const originalFarmerId = credit.owner;
    credit.available = false;
    credit.owner = req.user._id;
    await credit.save({ session });

    // 2. Mark marketplace listing as inactive
    await Marketplace.findOneAndUpdate(
      { creditId: credit._id },
      { active: false },
      { session }
    );

    // 3. Create Transaction
    const transaction = await Transaction.create([{
      creditId: credit._id,
      buyerId: req.user._id,
      farmerId: originalFarmerId,
      amount: credit.tonsCO2 * credit.pricePerTon,
      date: new Date()
    }], { session });

    // 4. Generate Certificate Hash (Blockchain Layer Option A)
    const certData = `${transaction[0]._id}-${credit.landId}-${req.user._id}-${Date.now()}`;
    const hash = crypto.createHash('sha256').update(certData).digest('hex');

    // PDF generation will be handled by a service, for now we mock the URL
    const pdfUrl = `/uploads/cert-${transaction[0]._id}.pdf`;

    const certificate = await Certificate.create([{
      transactionId: transaction[0]._id,
      projectId: credit.landId,
      pdfUrl,
      hash
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Purchase successful', transaction: transaction[0], certificate: certificate[0] });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message || 'Transaction failed' });
  }
});

export default router;
