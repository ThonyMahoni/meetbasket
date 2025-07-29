import express from 'express';
//import prisma from '../prisma/lib.js';
import prisma from '../src/prisma.js'; // ✅ neu
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 120 }); // Cache für 2 Minuten


const router = express.Router();

// Alle Turniere abrufen
router.get('/', async (req, res) => {
  const cachedTournaments = cache.get('all_tournaments');

  if (cachedTournaments) {
    return res.json(cachedTournaments); // 🎉 Cache-Hit
  }

  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: { date: 'asc' },
      include: { participants: true },
    });

    cache.set('all_tournaments', tournaments); // ✅ Cache speichern
    res.json(tournaments);
  } catch (error) {
    console.error('Fehler beim Abrufen der Turniere:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});



// Neues Turnier erstellen (POST)
router.post('/', async (req, res) => {
  const { title, organizer, date, format, location, entryFee, prizes, maxParticipants, creatorId } = req.body;

  if (!title || !organizer || !date || !format || !location) {
    return res.status(400).json({ error: 'Pflichtfelder fehlen' });
  }

  try {
    const tournament = await prisma.tournament.create({
      data: {
        title,
        organizer,
        date: new Date(date),
        format,
        location,
        entryFee: entryFee || null, // 🔁 einfach als String durchreichen
        prizes: prizes || null,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        creatorId,
      }
    });

    cache.del('all_tournaments');
    res.status(201).json({ message: 'Turnier erfolgreich erstellt', id: tournament.id });
  } catch (error) {
    console.error('Fehler beim Erstellen des Turniers:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});


// Beitritt zu einem Turnier
router.post('/:id/join', async (req, res) => {
    const tournamentId = parseInt(req.params.id);
    const { userId } = req.body;
  
    if (!userId || isNaN(tournamentId)) {
      return res.status(400).json({ error: 'Ungültige Daten' });
    }
  
    try {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: { participants: true }, // falls relation vorhanden
      });
  
      if (!tournament) return res.status(404).json({ error: 'Turnier nicht gefunden' });
  
      // Check: maxParticipants erreicht?
      if (
        typeof tournament.maxParticipants === 'number' &&
        tournament.participants.length >= tournament.maxParticipants
      ) {
        return res.status(400).json({ error: 'Turnier ist voll' });
      }
  
      // Prüfen, ob User schon angemeldet ist
      const alreadyJoined = tournament.participants.some((p) => p.id === userId);
      if (alreadyJoined) {
        return res.status(400).json({ error: 'Benutzer ist bereits angemeldet' });
      }
  
      // Teilnehmer hinzufügen
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          participants: {
            connect: { id: userId },
          },
        },
      });
      cache.del('all_tournaments');

  
      res.status(200).json({ message: 'Beitritt erfolgreich' });
    } catch (err) {
      console.error('Fehler beim Turnierbeitritt:', err);
      res.status(500).json({ error: 'Serverfehler beim Beitritt' });
    }
  });


  // routes/tournaments.js leave
router.post('/:id/leave', async (req, res) => {
    const tournamentId = parseInt(req.params.id);
    const { userId } = req.body;
  
    if (!userId || isNaN(tournamentId)) {
      return res.status(400).json({ error: 'Ungültige Daten' });
    }
  
    try {
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          participants: {
            disconnect: { id: userId },
          },
        },
      });
      cache.del('all_tournaments');

  
      res.status(200).json({ message: 'Erfolgreich ausgetreten' });
    } catch (err) {
      console.error('Fehler beim Austritt:', err);
      res.status(500).json({ error: 'Serverfehler beim Austritt' });
    }
  });
  
  // Turnier bearbeiten
router.put('/:id', async (req, res) => {
    const tournamentId = parseInt(req.params.id);
    const {
      title,
      organizer,
      date,
      format,
      location,
      prizes,
      maxParticipants,
    } = req.body;
  
    if (!title || !organizer || !date || !format || !location) {
      return res.status(400).json({ error: 'Pflichtfelder fehlen' });
    }
  
    try {
      const updatedTournament = await prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          title,
          organizer,
          date: new Date(date),
          format,
          location,
          prizes: prizes || null,
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        },
      });
      cache.del('all_tournaments');

  
      res.status(200).json(updatedTournament);
    } catch (error) {
      console.error('Fehler beim Bearbeiten des Turniers:', error);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  });
  

export default router;
