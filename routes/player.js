// Nur zuständig für Ratings, obwohl der Dateiname verwirrt!
import express from 'express';
import prisma from '../src/prisma.js'; 
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 120 }); // ⏱ 2 Minuten Cache für Spielerliste



const router = express.Router();


// POST: Rating erstellen oder updaten
router.post('/', async (req, res) => {
  const { raterId, ratedId, score } = req.body;

  try {
    const existing = await prisma.rating.findFirst({
      where: { raterId, ratedId },
    });

    if (existing) {
      const updated = await prisma.rating.update({
        where: { id: existing.id },
        data: { score },
      });
      return res.json(updated);
    }

    const newRating = await prisma.rating.create({
      data: { raterId, ratedId, score },
    });

    cache.del(`players_for_${raterId}`);
    res.json(updated || newRating);
  } catch (error) {
    console.error('Fehler beim Bewerten:', error);
    res.status(500).json({ error: 'Fehler beim Bewerten' });
  }
});

// GET: Spieler mit Bewertung vom eingeloggten User liefern
// Beispiel: /api/player?userId=123
router.get('/', async (req, res) => {
  const userId = Number(req.query.userId);
  if (!userId) {
    return res.status(400).json({ error: 'userId query param missing or invalid' });
  }

  const cacheKey = `players_for_${userId}`;
  const cachedPlayers = cache.get(cacheKey);
  if (cachedPlayers) return res.json(cachedPlayers); // 🧊 Cache-Hit

  try {
    const players = await prisma.user.findMany({
      where: {
        id: { not: userId }
      },
      select: {
        id: true,
        username: true,
        position: true,
        skillLevel: true,
        createdAt: true,
        location: true,
        achievements: true,
        ratingsReceived: {
          select: {
            raterId: true,
            score: true
          }
        }
      }
    });

    const playersWithRatings = players.map((player) => {
      const ratings = player.ratingsReceived;
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
        : 0;
      const latestRating = ratings.find((r) => r.raterId === userId)?.score ?? null;

      return {
        id: player.id,
        username: player.username,
        position: player.position,
        skillLevel: player.skillLevel,
        createdAt: player.createdAt,
        location: player.location,
        achievements: player.achievements,
        averageRating,
        latestRating
      };
    });

    cache.set(cacheKey, playersWithRatings); // ✅ speichern
    res.json(playersWithRatings);
  } catch (error) {
    console.error('Fehler beim Laden der Spieler:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Spieler' });
  }
});





export default router;
