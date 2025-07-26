import express from 'express';
import prisma from './src/prisma.js'; 

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const players = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        skillLevel: true,
        position: true,
        isPremium: true,
        premiumUntil: true,
        createdAt: true,
        
      }
    });

    res.json({ players });
  } catch (error) {
    console.error('Fehler beim Laden der Spieler:', error);
    res.status(500).json({ message: 'Spieler konnten nicht geladen werden.' });
  }
});

export default router;
