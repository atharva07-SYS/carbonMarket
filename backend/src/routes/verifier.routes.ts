import express from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import Verification from '../models/Verification';
import Land from '../models/Land';
import CarbonCredit from '../models/CarbonCredit';
import Marketplace from '../models/Marketplace';
import BuyerProfile from '../models/BuyerProfile';

const router = express.Router();

router.use(authenticate);
router.use(requireRole(['verifier']));

// Get pending verification queue
router.get('/queue', async (req: any, res: any) => {
  try {
    const pending = await Verification.find({ verifierReviewed: false })
      .populate({
        path: 'landId',
        populate: {
          path: 'farmerId',
          populate: { path: 'ngoId' }
        }
      });
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Review verification
router.post('/review/:id', async (req: any, res: any) => {
  try {
    const { decision, reason } = req.body; // 'Approved' | 'Rejected'
    const verification = await Verification.findById(req.params.id);
    
    if (!verification) return res.status(404).json({ message: 'Verification not found' });
    if (verification.verifierReviewed) return res.status(400).json({ message: 'Already reviewed' });

    verification.verifierReviewed = true;
    verification.reviewedBy = req.user._id;
    verification.decision = decision;
    if (reason) verification.reason = reason;

    await verification.save();

    const land = await Land.findById(verification.landId);
    if (!land) return res.status(404).json({ message: 'Land not found' });

    if (decision === 'Approved') {
      land.status = 'Verified';
      await land.save();

      // Mint Carbon Credit
      const credit = await CarbonCredit.create({
        landId: land._id,
        tonsCO2: verification.carbonEstimated || 100, // fallback if not set
        pricePerTon: 25, // Default price, could be dynamic
        owner: land.farmerId,
        available: true
      });

      // List on Marketplace
      await Marketplace.create({
        creditId: credit._id,
        active: true
      });
    } else {
      land.status = 'Rejected';
      await land.save();
    }

    res.json({ message: `Verification ${decision}`, verification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get pending buyers
router.get('/buyers', async (req: any, res: any) => {
  try {
    const pending = await BuyerProfile.find({ status: 'Pending' });
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Approve/Reject buyer
router.post('/buyers/:id', async (req: any, res: any) => {
  try {
    const { status } = req.body; // 'Verified' or 'Rejected'
    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const profile = await BuyerProfile.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!profile) return res.status(404).json({ message: 'Buyer profile not found' });

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
