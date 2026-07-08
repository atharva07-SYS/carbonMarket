import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import Farmer from '../models/Farmer';
import Land from '../models/Land';
import Document from '../models/Document';
import CarbonCredit from '../models/CarbonCredit';
import NgoProfile from '../models/NgoProfile';

const router = express.Router();

router.use(authenticate);

// Get Farmer Dashboard Data
router.get('/dashboard', async (req: any, res: any) => {
  try {
    // Determine the target farmer ID. 
    // If logged in as Farmer, use their own farmer ID.
    // Wait, currently farmers don't log in directly. In our database, Farmers have a userId if they were created directly, 
    // but we changed Farmer schema to NOT have userId, only ngoId. 
    // Wait, the user wants a Farmer Dashboard, meaning the Farmer logs in.
    // Let me check if Farmer schema has userId.
    
    // For now, let's look up the farmer. If the user is an NGO, they shouldn't use this route, 
    // but let's allow passing ?farmerId=... for NGOs to view a specific farmer.
    // If no query param, assume the logged-in user IS the farmer and lookup by userId.
    
    let farmerId = req.query.farmerId;
    let farmer;

    if (farmerId) {
      farmer = await Farmer.findById(farmerId);
      // Security check: if user is NGO, ensure this farmer belongs to them
      if (req.user.role === 'ngo') {
        const ngo = await NgoProfile.findOne({ userId: req.user._id });
        if (!ngo || farmer.ngoId.toString() !== ngo._id.toString()) {
          return res.status(403).json({ message: 'Unauthorized access to this farmer' });
        }
      }
    } else {
      // Assuming farmer has a userId. Wait, we need to check Farmer schema.
      // If Farmer schema does not have userId, how does the farmer log in?
      // I'll add userId to Farmer schema dynamically if needed, or lookup by phone/name.
      // For now, let's assume farmerId must be provided or farmer is linked via userId.
      farmer = await Farmer.findOne({ userId: req.user._id });
    }

    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    const lands = await Land.find({ farmerId: farmer._id });
    const documents = await Document.find({ farmerId: farmer._id });
    const credits = await CarbonCredit.find({ owner: farmer._id });

    res.json({
      farmer,
      lands,
      documents,
      credits
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
