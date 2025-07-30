import express from 'express';
import prisma from '../src/prisma.js'; 
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 180 }); // z. B. 3 Minuten Cache


const router = express.Router();
 

// GET /api/activity/home?currentUserId=123
router.get('/home', async (req, res) => {
  const currentUserId = req.query.currentUserId || 'guest'; // fallback für nicht eingeloggte
  const cacheKey = `activity_home_${currentUserId}`;

  // 🔍 Cache prüfen
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`[CACHE HIT] home activity für user ${currentUserId}`);
    return res.json(cached);
  }

  console.log(`[CACHE MISS] lade home activity für user ${currentUserId}`);

  try {
    // Daten wie gehabt laden …
    const allGames = await prisma.game.findMany({
      where: { date: { gte: new Date() } },
      include: { court: true, participants: true },
      orderBy: { date: 'asc' },
      take: 5,
    });

    const nearbyCourts = await prisma.court.findMany({ take: 5 });

    const recentGames = await prisma.game.findMany({
      where: { date: { lt: new Date() } },
      include: { court: true, participants: true },
      orderBy: { date: 'desc' },
      take: 5,
    });

    const mappedGames = recentGames.map(game => ({
      id: `game-${game.id}`,
      type: 'game',
      createdAt: game.date,
      game,
    }));

    const recentCheckins = await prisma.checkin.findMany({
      include: { user: true, court: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const mappedCheckins = recentCheckins.map(checkin => ({
      id: `checkin-${checkin.id}`,
      type: 'checkin',
      createdAt: checkin.createdAt,
      checkin,
    }));

    let mappedFriendRequests = [];
    if (currentUserId !== 'guest') {
      const recentFriendRequests = await prisma.friendship.findMany({
        where: {
          status: 'pending',
          addresseeId: parseInt(currentUserId),
        },
        include: { requester: true, addressee: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      mappedFriendRequests = recentFriendRequests.map(request => ({
        id: `friendship-${request.id}`,
        type: 'friendRequest',
        createdAt: request.createdAt,
        friendRequest: request,
      }));
    }

    const recentActivity = [
      ...mappedGames,
      ...mappedCheckins,
      ...mappedFriendRequests,
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    const response = {
      allGames,
      nearbyCourts,
      recentActivity,
    };

    cache.set(cacheKey, response); // ✅ Cache setzen
    console.log(`[CACHE SET] home activity gecached für user ${currentUserId}`);

    res.json(response);
  } catch (error) {
    console.error('Fehler beim Laden der Home-Daten:', error);
    res.status(500).json({
      error: 'Fehler beim Laden der Home-Daten',
      details: error.message,
    });
  }
});


export default router;
