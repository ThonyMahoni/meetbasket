import express from 'express';
import prisma from './src/prisma.js'; 
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 60 }); // Cache für 60 Sekunden


const router = express.Router();


router.get('/', async (req, res) => {
  const cachedPlayers = cache.get('all_players');

  if (cachedPlayers) {
    return res.json({ players: cachedPlayers }); // Cache-Hit 🎯
  }

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

    cache.set('all_players', players); // Cache speichern ✅
    res.json({ players });
  } catch (error) {
    console.error('Fehler beim Laden der Spieler:', error);
    res.status(500).json({ message: 'Spieler konnten nicht geladen werden.' });
  }
});


export default router;
