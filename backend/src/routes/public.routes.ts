import express from 'express';
import Farmer from '../models/Farmer';
import CarbonCredit from '../models/CarbonCredit';
import Transaction from '../models/Transaction';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const totalFarmers = await Farmer.countDocuments();
    
    const credits = await CarbonCredit.find({});
    const tonsCO2Verified = credits.reduce((sum, credit) => sum + credit.tonsCO2, 0);
    
    const transactions = await Transaction.find({});
    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    res.json({
      totalFarmers,
      tonsCO2Verified,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

export default router;
