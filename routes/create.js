import express from 'express';
//import prisma from '../prisma/lib.js';
import prisma from '../src/prisma.js'; // ✅ neu

const router = express.Router();

router.post('/create', async (req, res) => {
  const { name, location, logo, playerIds = [], creatorId } = req.body;

  try {
    const team = await prisma.team.create({
      data: {
        name,
        location,
        logo,
        creatorId
      }
    });

    // Creator als Captain hinzufügen
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: creatorId,
        role: 'Captain'
      }
    });

    // Restliche Spieler als Member hinzufügen
    const filteredPlayerIds = playerIds.filter(id => id !== creatorId);

    const members = await prisma.teamMember.createMany({
      data: filteredPlayerIds.map((playerId) => ({
        teamId: team.id,
        userId: playerId,
        role: 'member'
      }))
    });

    res.status(201).json({ team, members });
  } catch (error) {
    console.error('❌ Fehler beim Erstellen des Teams:', error);
    res.status(500).json({ message: 'Serverfehler beim Erstellen des Teams' });
  }
});

export default router;
