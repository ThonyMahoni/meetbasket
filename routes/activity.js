import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/activity/home?currentUserId=123
router.get('/home', async (req, res) => {
  const currentUserId = req.query.currentUserId;

  try {
    // ⏩ Kommende Spiele
    const allGames = await prisma.game.findMany({
      where: { date: { gte: new Date() } },
      include: { court: true, participants: true },
      orderBy: { date: 'asc' },
      take: 5,
    });

    // 📍 Nahegelegene Plätze
    const nearbyCourts = await prisma.court.findMany({ take: 5 });

    // 🕰 Vergangene Spiele → Recent Activity
    const recentGames = await prisma.game.findMany({
      where: { date: { lt: new Date() } },
      include: { court: true, participants: true },
      orderBy: { date: 'desc' },
      take: 5,
    });

    const mappedGames = recentGames.map((game) => ({
      id: `game-${game.id}`,
      type: 'game',
      createdAt: game.date,
      game,
    }));

    // ✅ Checkins
    const recentCheckins = await prisma.checkin.findMany({
      include: {
        user: true,
        court: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const mappedCheckins = recentCheckins.map((checkin) => ({
      id: `checkin-${checkin.id}`,
      type: 'checkin',
      createdAt: checkin.createdAt,
      checkin,
    }));

    // ✅ Freundschaftsanfragen (nur wenn currentUserId vorhanden)
    let mappedFriendRequests = [];
    if (currentUserId) {
      const recentFriendRequests = await prisma.friendship.findMany({
        where: {
          status: 'pending',
          addresseeId: parseInt(currentUserId),
        },
        include: {
          requester: true,
          addressee: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      mappedFriendRequests = recentFriendRequests.map((request) => ({
        id: `friendship-${request.id}`,
        type: 'friendRequest',
        createdAt: request.createdAt,
        friendRequest: request,
      }));
    }

    // 🔀 Alle Aktivitäten kombiniert & sortiert
    const recentActivity = [
      ...mappedGames,
      ...mappedCheckins,
      ...mappedFriendRequests,
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({
      allGames,
      nearbyCourts,
      recentActivity,
    });
  } catch (error) {
    console.error('Fehler beim Laden der Home-Daten:', error);
    res.status(500).json({
      error: 'Fehler beim Laden der Home-Daten',
      details: error.message,
    });
  }
});

export default router;
