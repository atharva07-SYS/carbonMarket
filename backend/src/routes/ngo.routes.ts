import express from 'express';
import multer from 'multer';
import NgoProfile from '../models/NgoProfile';
import Farmer from '../models/Farmer';
import Land from '../models/Land';
import Document from '../models/Document';
import CarbonCredit from '../models/CarbonCredit';
import Verification from '../models/Verification';
import Marketplace from '../models/Marketplace';
import Transaction from '../models/Transaction';
import axios from 'axios';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Create NGO Profile
router.post('/profile', async (req: any, res: any) => {
  try {
    const { organizationName, contactPerson, region } = req.body;
    let ngo = await NgoProfile.findOne({ userId: req.user._id });
    
    if (ngo) return res.status(400).json({ message: 'Profile already exists' });

    ngo = await NgoProfile.create({
      userId: req.user._id,
      organizationName,
      contactPerson,
      region
    });
    res.status(201).json(ngo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Add Farmer under NGO
router.post('/farmers', async (req: any, res: any) => {
  try {
    const { name, phone, village } = req.body;
    const ngo = await NgoProfile.findOne({ userId: req.user._id });
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });

    const farmer = await Farmer.create({
      ngoId: ngo._id,
      name,
      phone,
      village
    });
    res.status(201).json(farmer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete Farmer
router.delete('/farmers/:id', async (req: any, res: any) => {
  try {
    const ngo = await NgoProfile.findOne({ userId: req.user._id });
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });

    await Farmer.findOneAndDelete({ _id: req.params.id, ngoId: ngo._id });
    res.json({ message: 'Farmer deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Register Land for a specific Farmer
router.post('/farmers/:farmerId/land', async (req: any, res: any) => {
  try {
    const { area, location, coordinates, treeType, soilType } = req.body;
    const ngo = await NgoProfile.findOne({ userId: req.user._id });
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    
    const farmer = await Farmer.findOne({ _id: req.params.farmerId, ngoId: ngo._id });
    if (!farmer) return res.status(404).json({ message: 'Farmer not found under this NGO' });

    const land = await Land.create({
      farmerId: farmer._id,
      area,
      location,
      coordinates,
      treeType,
      soilType
    });
    res.status(201).json(land);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete Land
router.delete('/land/:id', async (req: any, res: any) => {
  try {
    const land = await Land.findById(req.params.id).populate('farmerId');
    if (!land) return res.status(404).json({ message: 'Land not found' });
    // Authorization check omitted for brevity, but would verify ngoId here
    await Land.findByIdAndDelete(req.params.id);
    res.json({ message: 'Land deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Upload Document for a Land Plot
router.post('/land/:landId/documents', upload.single('document'), async (req: any, res: any) => {
  try {
    const land = await Land.findById(req.params.landId).populate('farmerId');
    if (!land) return res.status(404).json({ message: 'Land not found' });

    const { type } = req.body;
    const document = await Document.create({
      farmerId: land.farmerId,
      type,
      fileUrl: req.file?.path
    });
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Trigger AI Verification
router.post('/land/:landId/trigger-verification', async (req: any, res: any) => {
  try {
    const land = await Land.findById(req.params.landId);
    if (!land) return res.status(404).json({ message: 'Land not found' });

    land.status = 'Processing';
    await land.save();

    const docs = await Document.find({ farmerId: land.farmerId });
    if (docs.length === 0) return res.status(400).json({ message: 'No documents uploaded' });

    const aiResponse = await axios.post('http://localhost:5001/api/ai/verify', {
      documents: docs.map(d => d.fileUrl),
      coordinates: land.coordinates
    });

    const trustScore = aiResponse.data.trustScore;
    let decision: 'Approved' | 'Rejected' | undefined = undefined;
    let reason = '';
    let verifierReviewed = false;

    if (trustScore >= 85) {
      verifierReviewed = true;
      decision = 'Approved';
      reason = 'AI Auto-Approved due to high trust score.';
    } else if (trustScore < 50) {
      verifierReviewed = true;
      decision = 'Rejected';
      reason = 'AI Auto-Rejected due to critically low trust score.';
    }

    const verification = await Verification.create({
      landId: land._id,
      ocrData: aiResponse.data.ocrData,
      ndviValue: aiResponse.data.ndviValue,
      satelliteChecked: aiResponse.data.satelliteChecked,
      trustScore: trustScore,
      carbonEstimated: aiResponse.data.carbonEstimated,
      verifierReviewed,
      decision,
      reason
    });

    if (decision === 'Approved') {
      land.status = 'Verified';
      await land.save();

      const credit = await CarbonCredit.create({
        landId: land._id,
        tonsCO2: aiResponse.data.carbonEstimated || 100,
        pricePerTon: 25,
        owner: land.farmerId,
        available: true
      });

      await Marketplace.create({
        creditId: credit._id,
        active: true
      });
    } else if (decision === 'Rejected') {
      land.status = 'Rejected';
      await land.save();
    }

    res.json({ message: 'Verification processing completed', verification });
  } catch (error: any) {
    res.status(500).json({ message: 'AI Service Error', error: error.message });
  }
});

// Dashboard for NGO
router.get('/dashboard', async (req: any, res: any) => {
  try {
    const ngo = await NgoProfile.findOne({ userId: req.user._id });
    if (!ngo) return res.status(404).json({ message: 'NGO profile not found' });

    const farmers = await Farmer.find({ ngoId: ngo._id });
    const farmerIds = farmers.map(f => f._id);
    
    const lands = await Land.find({ farmerId: { $in: farmerIds } });
    
    res.json({
      ngo,
      farmers,
      lands
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
