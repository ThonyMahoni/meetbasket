import express from 'express';
import { PrismaClient } from '@prisma/client';
import { badgeCatalog } from '../src/utils/badgeCatalog.js';
import { authenticateUser } from '../middleware/auth.js';

import multer from 'multer';
import path from 'path';
import fs from 'fs';




const router = express.Router();
const prisma = new PrismaClient();


// ✅ Geschützte Route
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        achievements: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    res.json(user);
  } catch (err) {
    console.error('Fehler bei /me:', err);
    res.status(500).json({ message: 'Serverfehler' });
  }
});

// ⚙️ Multer Konfiguration
const uploadDir = './public/avatars';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.params.userId}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 }, // 200 KB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Nur JPEG/PNG erlaubt'));
  },
});

// 📤 POST /api/profile/:userId/avatar
router.post('/:userId/avatar', upload.single('avatar'), async (req, res) => {
    const userId = parseInt(req.params.userId);
    const avatarUrl = `/avatars/${req.file.filename}`;
  
    try {
      await prisma.profile.update({
        where: { userId },
        data: { imageUrl: avatarUrl }, // ✅ Korrektur hier
      });
  
      res.json({ imageUrl: avatarUrl });
    } catch (error) {
      console.error('Fehler beim Speichern des Profilbildes:', error);
      res.status(500).json({ error: 'Fehler beim Speichern des Bildes' });
    }
  });
  



// 🧾 GET /api/profile/:userId
router.get('/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Ungültige Benutzer-ID' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        achievements: true,
        location: true,
        participations: {
          include: {
            team: true,
            game: {
              include: {
                court: true,
                stats: true,
                participants: {
                  select: {
                    userId: true,
                    teamId: true,
                  },
                },
              },
            },
          },
        },
        stats: true,
        gamesOrganized: true,
        tournaments: true,
        createdTournaments: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });

    let wins = 0;
    let losses = 0;
    let totalPoints = 0;
    let totalRebounds = 0;
    let totalGames = user.stats.length;
    const recentGames = [];

    const courtsPlayedOn = new Set();
    let streakOver15 = 0;
    let maxStreak = 0;
    let streakOver10 = 0;
    let maxStreak10 = 0;
    let hasDoubleDouble = false;
    let hasFullStat = false;
    let reboundMonster = false;
    let freeThrowProfi = false;

    for (const p of user.participations) {
      const game = p.game;

      if (game?.court?.id) courtsPlayedOn.add(game.court.id);

      // 📊 Score-Anzeige
      let scoreDisplay = '-';
      if (Array.isArray(game.score)) scoreDisplay = game.score.join(':');
      else if (typeof game.score === 'string') scoreDisplay = game.score;
      else if (game.score) scoreDisplay = String(game.score);

      const stat = Array.isArray(game.stats) ? game.stats.find(s => s.playerId === userId) : null;

      if (stat) {
        totalPoints += stat.points ?? 0;
        totalRebounds += stat.rebounds ?? 0;

        // Badge: Streaks prüfen
        if ((stat.points ?? 0) > 15) {
          streakOver15++;
          maxStreak = Math.max(maxStreak, streakOver15);
        } else {
          streakOver15 = 0;
        }

        if ((stat.points ?? 0) >= 10) {
          streakOver10++;
          maxStreak10 = Math.max(maxStreak10, streakOver10);
        } else {
          streakOver10 = 0;
        }

        if ((stat.rebounds ?? 0) >= 10) reboundMonster = true;
        if ((stat.points ?? 0) >= 10 && (stat.rebounds ?? 0) >= 10) hasDoubleDouble = true;
        if (
          ['points', 'rebounds', 'assists', 'steals', 'blocks'].every(
            key => stat[key] !== null && stat[key] !== undefined
          )
        ) {
          hasFullStat = true;
        }

        if (
          (stat.freeThrowsMade ?? 0) >= 5 &&
          (stat.freeThrowsAttempted ?? 0) > 0 &&
          stat.freeThrowsMade / stat.freeThrowsAttempted === 1
        ) {
          freeThrowProfi = true;
        }
      }

      const statsDisplay = stat
        ? `Points: ${stat.points ?? 0}, Rebounds: ${stat.rebounds ?? 0}`
        : '-';

      const participantEntry = game.participants.find(pa => pa.userId === userId);
      const playerTeamId = participantEntry?.teamId;
      let winningTeamId = null;

      if (game.result === 'Team A gewinnt') winningTeamId = game.teamAId;
      if (game.result === 'Team B gewinnt') winningTeamId = game.teamBId;

      let userWon = false;
      if (playerTeamId && winningTeamId && playerTeamId === winningTeamId) {
        wins++;
        userWon = true;
      } else if (playerTeamId && winningTeamId) {
        losses++;
      }

      const d = game.date;
      const formattedDate = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;

      recentGames.push({
        id: game.id,
        date: formattedDate,
        court: game.court?.name || 'Unbekannt',
        won: userWon,
        score: scoreDisplay,
        stats: statsDisplay,
      });
    }

    const playerStats = {
      gamesPlayed: totalGames,
      wins,
      losses,
      pointsPerGame: totalGames > 0 ? (totalPoints / totalGames).toFixed(1) : 0,
      reboundsPerGame: totalGames > 0 ? (totalRebounds / totalGames).toFixed(1) : 0,
    };

    // 🏆 Dynamisch erreichte Badges berechnen
    const gamesOrganized = user.gamesOrganized?.length ?? 0;
    const tournamentsCreated = user.tournamentsCreated?.length ?? 0;
    const tournamentsJoined = user.tournaments?.length ?? 0;

    const dynamicBadges = badgeCatalog.map(badge => {
        const name = badge.name;
        const achieved =
          name === 'Starter' ||
          (name === 'First Game' && totalGames >= 1) ||
          (name === 'Rookie' && totalGames >= 10) ||
          (name === 'Scorer' && totalPoints >= 100) ||
          (name === 'Top Scorer' && maxStreak >= 3) ||
          (name === 'Konsistenz-König' && maxStreak10 >= 5) ||
          (name === 'Rebound Monster' && reboundMonster) ||
          (name === 'Rebound-Meister' && reboundMonster) || // optionaler Alias
          (name === 'Double Double' && hasDoubleDouble) ||
          (name === 'Statistiker' && hasFullStat) ||
          (name === 'Freiwurf-Profi' && freeThrowProfi) ||
          (name === 'Court Hopper' && courtsPlayedOn.size > 5) ||
          (name === 'Lokal-Legende' && courtsPlayedOn.size >= 10) ||
          (name === 'Ironman' && totalGames >= 20) ||
          (name === 'Veteran' && totalGames >= 100) ||
          (name === 'Game Organizer' && gamesOrganized >= 5) ||
          (name === 'Turnierleiter' && tournamentsCreated >= 1) ||
          (name === 'Turnierheld' && tournamentsJoined >= 1);
      
        return { ...badge, achieved };
      });
      

    const locationString = user.location
      ? user.location.city || `${user.location.latitude}, ${user.location.longitude}`
      : '';

    res.json({
      id: user.id,
      username: user.username,
      name: user.profile?.name ?? user.username ?? '',
      skillLevel: user.skillLevel,
      position: user.position,
      location: locationString,
      profile: user.profile,
      achievements: dynamicBadges,
      recentGames,
      playerStats,
      email: user.email,
      isPremium: user.isPremium,
    });

  } catch (error) {
    console.error('❌ Serverfehler in /api/profile/:userId:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});


// 🛠 PUT /api/profile/:userId (Profil aktualisieren)
router.put('/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: 'Ungültige Benutzer-ID' });

  const {
    name,
    username,
    bio,
    position,
    height,
    skillLevel,
    location,
    latitude,
    longitude,
    email,
    phone,
  } = req.body;

  try {
    // 👤 Profil aktualisieren oder anlegen
    await prisma.profile.upsert({
      where: { userId },
      update: { bio, name, height, phone },
      create: { userId, bio, name, height, phone },
    });

    // 👤 User aktualisieren
    await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        position,
        skillLevel,
        email,
      },
    });

    // 📍 Location aktualisieren (nur wenn gültig)
    if (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    ) {
      await prisma.location.upsert({
        where: { userId },
        update: { latitude, longitude, city: location || '' },
        create: { userId, latitude, longitude, city: location || '' },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Fehler beim Profil-Update:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Profils' });
  }
});


// 📊 Spielerstatistik (Wins, Losses, Punkte etc.)
router.get('/:userId/stats', async (req, res) => {
    const userId = parseInt(req.params.userId);
  
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Ungültige Benutzer-ID' });
    }
  
    try {
        const participations = await prisma.gameParticipant.findMany({
            where: { userId },
            include: {
              game: {
                include: {
                  teamA: true,
                  teamB: true,
                  participants: true,
                  stats: true
                }
              },
              team: true // ✅ funktioniert jetzt
            }
          });
          
  
      let wins = 0;
      let losses = 0;
      let totalPoints = 0;
      let totalRebounds = 0;
      let totalGames = participations.length;
  
      for (const p of participations) {
        const game = p.game;
        const userTeamId = p.teamId;
  
        // 🏆 Gewinnerteam bestimmen
        let winningTeamId = null;
        if (game.result === 'teamA') winningTeamId = game.teamAId;
        if (game.result === 'teamB') winningTeamId = game.teamBId;
  
        // ✅ Win/Loss zählen
        if (userTeamId && winningTeamId) {
          if (userTeamId === winningTeamId) {
            wins++;
          } else {
            losses++;
          }
        }
  
        // 📊 Spielerstatistiken
        const stat = game.stats.find(s => s.playerId === userId);
        if (stat) {
          totalPoints += stat.points ?? 0;
          totalRebounds += stat.rebounds ?? 0;
        }
      }
  
      const stats = {
        gamesPlayed: totalGames,
        wins,
        losses,
        pointsPerGame: totalGames > 0 ? (totalPoints / totalGames).toFixed(1) : "0",
        reboundsPerGame: totalGames > 0 ? (totalRebounds / totalGames).toFixed(1) : "0",
        winRate: totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) + "%" : "0%"
      };
  
      res.json(stats);
    } catch (error) {
      console.error('❌ Fehler beim Laden der Statistik:', error);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  });


// ✅ GET /api/profile/by-username/:username
router.get('/by-username/:username', async (req, res) => {
    const { username } = req.params;
  
    try {
      const user = await prisma.user.findUnique({
        where: { username },
        include: {
          profile: true,
          achievements: true,
          location: true,
          participations: {
            include: {
              team: true,
              game: {
                include: {
                  court: true,
                  stats: true,
                  participants: {
                    select: { userId: true, teamId: true }
                  }
                }
              }
            }
          },
          stats: true,
          gamesOrganized: true,
          tournaments: true,
          createdTournaments: true,
          
        },
      });
  
      if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });
  
      const userId = user.id;
  
      let wins = 0;
      let losses = 0;
      let totalPoints = 0;
      let totalRebounds = 0;
      let totalGames = user.stats.length;
      const recentGames = [];
  
      const courtsPlayedOn = new Set();
      let streakOver15 = 0;
      let maxStreak = 0;
      let streakOver10 = 0;
      let maxStreak10 = 0;
      let hasDoubleDouble = false;
      let hasFullStat = false;
      let reboundMonster = false;
      let freeThrowProfi = false;
  
      for (const p of user.participations) {
        const game = p.game;
  
        if (game?.court?.id) courtsPlayedOn.add(game.court.id);
  
        let scoreDisplay = '-';
        if (Array.isArray(game.score)) scoreDisplay = game.score.join(':');
        else if (typeof game.score === 'string') scoreDisplay = game.score;
        else if (game.score) scoreDisplay = String(game.score);
  
        const stat = Array.isArray(game.stats) ? game.stats.find(s => s.playerId === userId) : null;
  
        if (stat) {
          totalPoints += stat.points ?? 0;
          totalRebounds += stat.rebounds ?? 0;
  
          if ((stat.points ?? 0) > 15) {
            streakOver15++;
            maxStreak = Math.max(maxStreak, streakOver15);
          } else {
            streakOver15 = 0;
          }
  
          if ((stat.points ?? 0) >= 10) {
            streakOver10++;
            maxStreak10 = Math.max(maxStreak10, streakOver10);
          } else {
            streakOver10 = 0;
          }
  
          if ((stat.rebounds ?? 0) >= 10) reboundMonster = true;
          if ((stat.points ?? 0) >= 10 && (stat.rebounds ?? 0) >= 10) hasDoubleDouble = true;
          if (
            ['points', 'rebounds', 'assists', 'steals', 'blocks'].every(
              key => stat[key] !== null && stat[key] !== undefined
            )
          ) {
            hasFullStat = true;
          }
  
          if (
            (stat.freeThrowsMade ?? 0) >= 5 &&
            (stat.freeThrowsAttempted ?? 0) > 0 &&
            stat.freeThrowsMade / stat.freeThrowsAttempted === 1
          ) {
            freeThrowProfi = true;
          }
        }
  
        const statsDisplay = stat
          ? `Points: ${stat.points ?? 0}, Rebounds: ${stat.rebounds ?? 0}`
          : '-';
  
        const participantEntry = game.participants.find(pa => pa.userId === userId);
        const playerTeamId = participantEntry?.teamId;
        let winningTeamId = null;
  
        if (game.result === 'Team A gewinnt') winningTeamId = game.teamAId;
        if (game.result === 'Team B gewinnt') winningTeamId = game.teamBId;
  
        let userWon = false;
        if (playerTeamId && winningTeamId && playerTeamId === winningTeamId) {
          wins++;
          userWon = true;
        } else if (playerTeamId && winningTeamId) {
          losses++;
        }
  
        const d = game.date;
        const formattedDate = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
  
        recentGames.push({
          id: game.id,
          date: formattedDate,
          court: game.court?.name || 'Unbekannt',
          won: userWon,
          score: scoreDisplay,
          stats: statsDisplay,
        });
      }
  
      const playerStats = {
        gamesPlayed: totalGames,
        wins,
        losses,
        pointsPerGame: totalGames > 0 ? (totalPoints / totalGames).toFixed(1) : 0,
        reboundsPerGame: totalGames > 0 ? (totalRebounds / totalGames).toFixed(1) : 0,
      };
  
      const gamesOrganized = user.gamesOrganized?.length ?? 0;
      const tournamentsCreated = user.createdTournaments?.length ?? 0;
      const tournamentsJoined = user.tournaments?.length ?? 0;
  
      const dynamicBadges = badgeCatalog.map(badge => {
        const name = badge.name;
        const achieved =
          name === 'Starter' ||
          (name === 'First Game' && totalGames >= 1) ||
          (name === 'Rookie' && totalGames >= 10) ||
          (name === 'Scorer' && totalPoints >= 100) ||
          (name === 'Top Scorer' && maxStreak >= 3) ||
          (name === 'Konsistenz-König' && maxStreak10 >= 5) ||
          (name === 'Rebound Monster' && reboundMonster) ||
          (name === 'Rebound-Meister' && reboundMonster) ||
          (name === 'Double Double' && hasDoubleDouble) ||
          (name === 'Statistiker' && hasFullStat) ||
          (name === 'Freiwurf-Profi' && freeThrowProfi) ||
          (name === 'Court Hopper' && courtsPlayedOn.size > 5) ||
          (name === 'Lokal-Legende' && courtsPlayedOn.size >= 10) ||
          (name === 'Ironman' && totalGames >= 20) ||
          (name === 'Veteran' && totalGames >= 100) ||
          (name === 'Game Organizer' && gamesOrganized >= 5) ||
          (name === 'Turnierleiter' && tournamentsCreated >= 1) ||
          (name === 'Turnierheld' && tournamentsJoined >= 1);
  
        return { ...badge, achieved };
      });
  
      const locationString = user.location
        ? user.location.city || `${user.location.latitude}, ${user.location.longitude}`
        : '';
  
      res.json({
        id: user.id,
        username: user.username,
        name: user.profile?.name ?? user.username ?? '',
        skillLevel: user.skillLevel,
        position: user.position,
        location: locationString,
        profile: user.profile,
        achievements: dynamicBadges,
        recentGames,
        playerStats,
        isPremium: user.isPremium
      });
    } catch (error) {
      console.error('❌ Fehler in GET /by-username:', error);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  });
  
  
  
export default router;
