import express from 'express';
import prisma from './src/prisma.js';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60 }); // Cache für 60 Sekunden

// 🆕 Neues Spiel erstellen
router.post('/', async (req, res) => {
  const {
    title,
    date,
    time,
    courtId,
    maxPlayers,
    skillLevel,
    description,
    isPublic,
    organizerId
  } = req.body;

  if (!title || !date || !time || !courtId || !organizerId) {
    return res.status(400).json({ message: 'Pflichtfelder fehlen für die Spiel-Erstellung.' });
  }

  try {
    const court = await prisma.court.findUnique({
      where: { id: Number(courtId) }
    });

    if (!court) {
      return res.status(404).json({ message: 'Court nicht gefunden.' });
    }

    const newGame = await prisma.game.create({
      data: {
        title,
        date: new Date(`${date}T${time}`),
        location: court.address || '',
        court: { connect: { id: Number(courtId) } },
        maxPlayers: Number(maxPlayers) || 10,
        skillLevel: skillLevel || 'All Levels',
        description: description || '',
        isPublic: isPublic !== false,
        organizer: {
          connect: { id: Number(organizerId) }
        }
      },
      include: {
        court: true,
        organizer: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    // 🧹 Cache leeren (alle relevanten Game-Listen)
    cache.del(`games_upcoming_${organizerId}`);
    cache.del(`games_all_${organizerId}`);

    return res.status(201).json({
      message: 'Spiel erfolgreich erstellt.',
      game: newGame
    });
  } catch (error) {
    console.error('❌ Fehler beim Erstellen des Spiels:', error);
    return res.status(500).json({
      message: 'Interner Fehler beim Speichern des Spiels.',
      detail: error.message
    });
  }
});

// 🔍 Alle Spiele abrufen mit Caching
router.get('/', async (req, res) => {
  const { tab, userId } = req.query;
  const userIdNum = Number(userId);
  const cacheKey = `games_${tab || 'all'}_${userIdNum || 'guest'}`;

  const cachedGames = cache.get(cacheKey);
  if (cachedGames) {
    return res.json({ games: cachedGames }); // 🧠 Cache-Hit
  }

  try {
    const allGames = await prisma.game.findMany({
      where: {
        date:
          tab === 'past'
            ? { lt: new Date() }
            : tab === 'upcoming'
            ? { gte: new Date() }
            : undefined
      },
      include: {
        court: true,
        organizer: {
          select: { id: true, username: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    const games = allGames.map(game => {
      const participants = game.participants || [];
      const validParticipants = participants.filter(p => p.user !== null);
      const playerUsernames = validParticipants.map(p => p.user.username);
      const joined = validParticipants.some(p => p.user.id === userIdNum);
      const joinedCount = validParticipants.length;

      return {
        id: game.id,
        title: game.title,
        date: game.date,
        time: game.date.toISOString().split('T')[1].slice(0, 5),
        location: game.court?.address || 'Unbekannt',
        result: game.result,
        maxPlayers: game.maxPlayers,
        skillLevel: game.skillLevel,
        description: game.description,
        isPublic: game.isPublic,

        court: game.court,
        organizer: game.organizer,

        joined,
        isFull: joinedCount >= game.maxPlayers,
        players: {
          joined: joinedCount,
          max: game.maxPlayers,
          names: playerUsernames
        }
      };
    });

    cache.set(cacheKey, games); // 🧠 Cache speichern
    res.json({ games });
  } catch (error) {
    console.error('❌ Fehler beim Abrufen der Spiele:', error);
    res.status(500).json({ message: 'Interner Serverfehler beim Abrufen der Spiele.' });
  }
});

// 🆕 Teilnahme zurückziehen (POST-Version für kompatibles Frontend)
router.post('/:gameId/leave/:userId', async (req, res) => {
  const { gameId, userId } = req.params;

  try {
    const participant = await prisma.gameParticipant.findUnique({
      where: {
        gameId_userId: {
          gameId: Number(gameId),
          userId: Number(userId)
        }
      }
    });

    if (!participant) {
      return res.status(404).json({ message: 'Teilnahme nicht gefunden.' });
    }

    await prisma.gameParticipant.delete({
      where: {
        gameId_userId: {
          gameId: Number(gameId),
          userId: Number(userId)
        }
      }
    });

    // 🧹 Cache leeren nach Leave-Aktion
    cache.del(`games_upcoming_${userId}`);
    cache.del(`games_all_${userId}`);

    res.status(200).json({ message: 'Teilnahme erfolgreich zurückgezogen.' });
  } catch (error) {
    console.error('❌ Fehler beim Zurückziehen der Teilnahme:', error);
    res.status(500).json({ message: 'Fehler beim Entfernen der Teilnahme.' });
  }
});

export default router;
