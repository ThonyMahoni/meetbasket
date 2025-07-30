import express from 'express';
import prisma from '../src/prisma.js'; 
import { calculateExpiryDate } from '../src/utils/premiumUtils.js';
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

const router = express.Router();


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

router.get('/status/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: 'Ungültige Benutzer-ID' });

  const cached = cache.get(`premium_${userId}`);
  if (cached) return res.json(cached); // ⚡ schneller Zugriff

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPremium: true,
        premiumTier: true,
        premiumExpiryDate: true
      }
    });

    if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });

    const result = {
      isPremium: user.isPremium,
      tier: user.premiumTier,
      expiryDate: user.premiumExpiryDate
    };

    cache.set(`premium_${userId}`, result); // 🧠 speichern
    res.json(result);
  } catch (error) {
    console.error('Fehler beim Abrufen des Premium-Status:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});


export default router;
