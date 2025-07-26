// games.js (NEU, komplett mit Fixes für Team-Zuweisung & Spielerstatistiken)
import express from 'express';
//import prisma from '../prisma/lib.js';
import prisma from '../src/prisma.js'; // ✅ neu

const router = express.Router();

router.get('/test', (req, res) => res.send('Games-Router funktioniert ✅'));

// 📋 Spiele laden (Upcoming/Past)
router.get('/', async (req, res) => {
  const { tab } = req.query;

  try {
    const games = await prisma.game.findMany({
      where: {
        date: tab === 'past' ? { lt: new Date() } : tab === 'upcoming' ? { gte: new Date() } : undefined
      },
      include: {
        court: true,
        organizer: { select: { id: true, username: true } },
        participants: { include: { user: true } },
        stats: { include: { player: { select: { id: true, username: true } } } },
        teamA: true,
        teamB: true
      },
      orderBy: { date: 'asc' }
    });

    const gamesWithPlayers = games.map(game => ({
      ...game,
      scoreDisplay: extractScoreDisplay(game.score) ?? '–',
      players: game.participants.map(p => p.user),
      teamAPlayers: game.participants.filter(p => p.team === 'A').map(p => p.user),
      teamBPlayers: game.participants.filter(p => p.team === 'B').map(p => p.user)
    }));

    res.json({ games: gamesWithPlayers });
  } catch (err) {
    console.error('❌ Fehler beim Laden der Spiele:', err);
    res.status(500).json({ message: 'Fehler beim Abrufen der Spiele' });
  }
});

// 🧾 Einzelnes Spiel abrufen
router.get('/:id', async (req, res) => {
  const gameId = parseInt(req.params.id);

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        court: true,
        organizer: { select: { id: true, username: true } },
        participants: {
          include: {
            user: { select: { id: true, username: true } }
          }
        },
        stats: {
          include: {
            player: { select: { id: true, username: true } }
          }
        },
        teamA: true,
        teamB: true
      }
    });

    if (!game) {
      return res.status(404).json({ message: 'Spiel nicht gefunden' });
    }

    // Teilnehmer extrahieren inkl. Team-Zuweisung
    // Teilnehmer extrahieren inkl. Team-Zuweisung
const participants = game.participants.map(p => ({
  user: p.user,
  teamId: p.teamId ?? null
}));

const teamAPlayers = participants.filter(p => p.teamId === game.teamAId).map(p => p.user);
const teamBPlayers = participants.filter(p => p.teamId === game.teamBId).map(p => p.user);
const allPlayers = participants.map(p => p.user);


    const gameDetails = {
      id: game.id,
      title: game.title,
      date: game.date,
      time: game.time,
      location: game.location,
      score: game.score ?? null,
      scoreDisplay: extractScoreDisplay(game.score) ?? '–',
      result: game.result ?? null,
      maxPlayers: game.maxPlayers,
      skillLevel: game.skillLevel,
      description: game.description,
      isPublic: game.isPublic,
      court: game.court,
      organizer: game.organizer,
      players: allPlayers,
      participants,
      teamAPlayers,
      teamBPlayers,
      teamA: game.teamA,
      teamB: game.teamB,
      stats: game.stats
    };

    res.json({ game: gameDetails });
  } catch (err) {
    console.error(`❌ Fehler beim Abrufen von Spiel #${gameId}:`, err);
    res.status(500).json({ message: 'Fehler beim Laden des Spiels' });
  }
});


// 💾 Ergebnis speichern
router.post('/:id/result', async (req, res) => {
  const gameId = parseInt(req.params.id);
  const { score, result, teamAId, teamBId, teamA = [], teamB = [], stats } = req.body;
  try {
    await prisma.game.update({
      where: { id: gameId },
      data: { score, result, teamAId, teamBId }
    });
    
  
    // Organizer-ID holen
    const gameInfo = await prisma.game.findUnique({
      where: { id: gameId },
      select: { organizerId: true }
    });
  
    const organizerId = gameInfo?.organizerId;
  
    // Bestehende Teilnehmer holen
    const existing = await prisma.gameParticipant.findMany({ where: { gameId } });
    const existingIds = existing.map(p => p.userId);

    // Organizer automatisch hinzufügen, falls nicht dabei
const game = await prisma.game.findUnique({ where: { id: gameId } });
if (game?.organizerId && !existingIds.includes(game.organizerId)) {
  await prisma.gameParticipant.create({
    data: { gameId, userId: game.organizerId, team: 'A' } // Standard: Team A
  });
  existingIds.push(game.organizerId); // aktualisiere Referenz
}

  
    // Teilnehmer-Team-Zuweisung aktualisieren
    await Promise.all(
      existing.map(p => {
        const newTeamId = teamA.includes(p.userId)
          ? game.teamAId
          : teamB.includes(p.userId)
            ? game.teamBId
            : null;
    
        if (newTeamId && newTeamId !== p.teamId) {
          return prisma.gameParticipant.update({
            where: { gameId_userId: { gameId, userId: p.userId } },
            data: { teamId: newTeamId }, // <<< hier verwenden!
          });
        }
    
        return Promise.resolve();
      })
    );
    
  
    // Neue Teilnehmer vorbereiten
    const newA = teamA
    .filter(id => !existingIds.includes(id))
    .map(userId => ({ gameId, userId, teamId: game.teamAId }));
  
  const newB = teamB
    .filter(id => !existingIds.includes(id))
    .map(userId => ({ gameId, userId, teamId: game.teamBId }));
  
  const addOrganizer =
    organizerId && !existingIds.includes(organizerId)
      ? [{ gameId, userId: organizerId, teamId: game.teamAId }]
      : [];
  
  
    const allNewParticipants = [...newA, ...newB, ...addOrganizer];
  
    if (allNewParticipants.length > 0) {
      await prisma.gameParticipant.createMany({ data: allNewParticipants });
    }
  
    // Spieler-Stats speichern
    if (stats && typeof stats === 'object') {
      await prisma.playerStat.deleteMany({ where: { gameId } });
  
      const entries = Object.entries(stats).map(([id, s]) => ({
        gameId,
        playerId: parseInt(id),
        points: parseInt(s.points) || 0,
        rebounds: parseInt(s.rebounds) || 0
      }));
  
      await prisma.playerStat.createMany({ data: entries });
    }
  
    // Spiel mit aktualisierten Daten zurückgeben
    const updatedGame = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        court: true,
        organizer: { select: { id: true, username: true } },
        participants: {
          include: {
            user: { select: { id: true, username: true } },
            team: true,  // optional, wenn du Team-Daten brauchst
          }
        },
        stats: { include: { player: { select: { id: true, username: true } } } },
        teamA: true,
        teamB: true
      }
    });
    
  
    res.json({
      ...updatedGame,
      players: updatedGame.participants.map(p => p.user),
      participants: updatedGame.participants.map(p => ({ user: p.user, team: p.team })),
      teamAPlayers: updatedGame.participants.filter(p => p.team === 'A').map(p => p.user),
      teamBPlayers: updatedGame.participants.filter(p => p.team === 'B').map(p => p.user)
    });
  } catch (err) {
    console.error('❌ Fehler beim Speichern:', err);
    res.status(500).json({ message: 'Fehler beim Speichern des Spiels' });
  }
});  

// ➕ Spiel beitreten
router.post('/:gameId/join', async (req, res) => {
  const gameId = parseInt(req.params.gameId);
  const { userId } = req.body;

  try {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return res.status(404).json({ message: 'Spiel nicht gefunden' });

    const existing = await prisma.gameParticipant.findUnique({
      where: { gameId_userId: { gameId, userId } }
    });

    if (existing) return res.status(400).json({ message: 'Du bist bereits beigetreten' });

    await prisma.gameParticipant.create({ data: { gameId, userId } });
    res.status(200).json({ message: 'Beigetreten' });
  } catch (err) {
    console.error('❌ Fehler beim Beitreten:', err);
    res.status(500).json({ message: 'Serverfehler beim Beitreten' });
  }
});

// 🗑️ Spiel löschen
router.delete('/:gameId', async (req, res) => {
  const gameId = parseInt(req.params.gameId);
  const { userId } = req.body;

  try {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return res.status(404).json({ message: 'Spiel nicht gefunden' });
    if (game.organizerId !== userId) return res.status(403).json({ message: 'Nur der Organisator kann das Spiel löschen' });

    await prisma.game.delete({ where: { id: gameId } });
    res.status(200).json({ message: 'Spiel wurde gelöscht' });
  } catch (err) {
    console.error('❌ Fehler beim Löschen:', err);
    res.status(500).json({ message: 'Fehler beim Löschen des Spiels' });
  }
});

// 🕵️ Nur Score & Ergebnis
router.get('/:id/check', async (req, res) => {
  const game = await prisma.game.findUnique({
    where: { id: parseInt(req.params.id) },
    select: { id: true, title: true, score: true, result: true }
  });

  if (!game) return res.status(404).json({ message: 'Spiel nicht gefunden' });
  res.json({ debug: game });
});

// 📥 Teams für Auswahl im Modal
router.get('/:id/teams', async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const myTeams = await prisma.team.findMany({
      where: { members: { some: { userId } } },
      include: { players: true }
    });

    const opponentTeams = await prisma.team.findMany({
      where: { members: { none: { userId } } },
      include: { players: true }
    });

    res.json({ myTeams, opponentTeams });
  } catch (err) {
    console.error('❌ Fehler beim Laden der Teams:', err);
    res.status(500).json({ message: 'Fehler beim Abrufen der Teams' });
  }
});

function extractScoreDisplay(score) {
  if (!score) return null;
  if (Array.isArray(score) && score.length === 2) return `${score[0]} : ${score[1]}`;
  if (typeof score === 'object' && score.teamA !== undefined && score.teamB !== undefined) return `${score.teamA} : ${score.teamB}`;
  if (typeof score === 'string') return score;
  return null;
}

export default router;
