// routes/teams.js
import express from 'express';
//import prisma from '../prisma/lib.js';
import prisma from '../src/prisma.js'; // ✅ neu
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 120 }); // Cache für 2 Minuten


const router = express.Router();

router.get('/', async (req, res) => {
  const cachedTeams = cache.get('all_teams');
  if (cachedTeams) return res.json(cachedTeams); // 🎯 Cache-Hit

  try {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    cache.set('all_teams', teams); // ✅ speichern
    res.json(teams);
  } catch (error) {
    console.error('Fehler beim Abrufen der Teams:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});



router.get('/:id', async (req, res) => {
  const teamId = Number(req.params.id);
  const cachedTeam = cache.get(`team_${teamId}`);
  if (cachedTeam) return res.json(cachedTeam); // 💨 Cache-Hit

  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    if (!team) return res.status(404).json({ error: 'Team nicht gefunden' });

    cache.set(`team_${teamId}`, team); // ✅ speichern
    res.json(team);
  } catch (error) {
    console.error('Fehler beim Abrufen des Teams:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

  

 // POST /api/teams/:id/rate
router.post('/:id/rate', async (req, res) => {
    const teamId = parseInt(req.params.id);
    const userId = req.body.userId;
  
    if (!userId) return res.status(400).json({ error: 'userId fehlt' });
  
    try {
      const existingRating = await prisma.teamRating.findUnique({
        where: {
          userId_teamId: {
            userId,
            teamId,
          }
        }
      });
  
      let updatedTeam;
  
      if (existingRating) {
        // Rating entfernen
        await prisma.teamRating.delete({
          where: {
            userId_teamId: {
              userId,
              teamId,
            }
          }
        });
  
        updatedTeam = await prisma.team.update({
          where: { id: teamId },
          data: {
            rating: {
              decrement: 1
            }
          }
        });
  
      } else {
        // Rating hinzufügen
        await prisma.teamRating.create({
          data: {
            userId,
            teamId
          }
        });
  
        updatedTeam = await prisma.team.update({
          where: { id: teamId },
          data: {
            rating: {
              increment: 1
            }
          }
        });
      }
     
  
      res.json(updatedTeam);
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Fehler beim Rating' });
    }
  });

  // PUT /api/teams/:id
router.put('/:id', async (req, res) => {
    const teamId = parseInt(req.params.id);
    const { name, location, logo, playerIds, userId } = req.body;
    const selectedPlayerIds = playerIds;
  
    
  
    try {
      // Team aktualisieren
      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: {
          name,
          location,
          logo,
          userId,
        },
      });
      cache.del(`team_${teamId}`);
      // Alte Mitglieder löschen
      await prisma.teamMember.deleteMany({
        where: { teamId },
      });
      
  
      // Neue Mitglieder hinzufügen
      if (selectedPlayerIds?.length > 0) {
        await prisma.teamMember.createMany({
          data: selectedPlayerIds.map((playerId) => ({
            teamId,
            userId: playerId,
            role: 'member', // <-- HIER ergänzt
          })),
        });
      }
      cache.del(`team_${teamId}`);
  
      res.json(updatedTeam);
  
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Teams:', error); // ← wichtig: komplettes Error-Objekt
        res.status(500).json({ error: error.message });
      }
      
  });
  
  

export default router;
