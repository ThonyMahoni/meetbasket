import express from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateExpiryDate } from '../src/utils/premiumUtils.js';


const router = express.Router();
const prisma = new PrismaClient();

// POST /api/premium/subscribe
router.post('/subscribe', async (req, res) => {
  const { userId, tier } = req.body;

  if (!userId || !tier) {
    return res.status(400).json({ error: 'userId and tier are required' });
  }

  try {
    const expiryDate = calculateExpiryDate(tier);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: true,
        premiumTier: tier,
        premiumExpiryDate: expiryDate
      }
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error subscribing to premium:', error);
    res.status(500).json({ error: 'Failed to subscribe to premium' });
  }
});

export default router;
