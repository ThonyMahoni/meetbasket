import express from 'express';
import prisma from './src/prisma.js'; 
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 120 }); // TTL = 2 Minuten

const router = express.Router();


// Speicherort und Dateinamen für Uploads konfigurieren
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'courts');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Beispiel: court-1634234234234.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `court-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// POST /api/courts/upload → Bild hochladen
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Kein Bild hochgeladen' });
    }

    // URL / Pfad zurückgeben, der im Frontend genutzt wird
    const imageUrl = `/uploads/courts/${req.file.filename}`;
    res.status(201).json({ imageUrl });
  } catch (error) {
    console.error('Fehler beim Bild-Upload:', error);
    res.status(500).json({ message: 'Bild-Upload fehlgeschlagen' });
  }
});

// GET /api/courts → Alle Courts abrufen
router.get('/', async (req, res) => {
  const cachedCourts = cache.get('all_courts');

  if (cachedCourts) {
    return res.json({ courts: cachedCourts }); // Cache-Hit 🎯
  }

  try {
    const courts = await prisma.court.findMany({
      orderBy: { name: 'asc' }
    });

    cache.set('all_courts', courts); // Cache speichern ✅
    res.json({ courts });
  } catch (error) {
    console.error('❌ Fehler beim Abrufen der Courts:', error);
    res.status(500).json({ message: 'Courts konnten nicht geladen werden.' });
  }
});

// POST /api/courts → Court speichern
router.post('/', async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      latitude,
      longitude,
      isIndoor,
      hasLights,
      isFree,
      image, // <--- Bild empfangen
    } = req.body;
    
    const newCourt = await prisma.court.create({
      data: {
        name,
        address,
        city,
        latitude,
        longitude,
        isIndoor,
        hasLights,
        isFree,
        image: image, // <--- wenn `image` ein Feld in deinem Prisma-Schema ist
      }
    });

    res.status(201).json(newCourt);
  } catch (error) {
    console.error('❌ Fehler beim Speichern des Courts:', error);
    res.status(500).json({ message: 'Court konnte nicht gespeichert werden.' });
  }
});


function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Erdradius in Kilometern

  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const radLat1 = deg2rad(lat1);
  const radLat2 = deg2rad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


// GET /api/courts/nearby?lat=52.5&lng=13.4
router.get('/nearby', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude und Longitude sind erforderlich.' });
  }

  try {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const courts = await prisma.court.findMany();

    const courtsWithDistance = courts.map((court) => {
      const distance = calculateDistance(userLat, userLng, court.latitude, court.longitude);
      return { ...court, distance };
    });

    // Nach Entfernung sortieren
    courtsWithDistance.sort((a, b) => a.distance - b.distance);

    res.json({ courts: courtsWithDistance });
  } catch (error) {
    console.error('❌ Fehler beim Abrufen der nahegelegenen Courts:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Courts.' });
  }
});

// POST /api/courts/:id/rate → Bewertung speichern
router.post('/:id/rate', async (req, res) => {
  const courtId = parseInt(req.params.id);
  const { rating, userId } = req.body; // UserId muss vom Frontend oder aus Auth-Middleware kommen

  if (!userId) {
    return res.status(400).json({ message: 'UserId ist erforderlich' });
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Ungültige Bewertung' });
  }

  try {
    const court = await prisma.court.findUnique({ where: { id: courtId } });
    if (!court) return res.status(404).json({ message: 'Court nicht gefunden' });

    // Upsert Bewertung (insert oder update, wenn bereits bewertet)
    await prisma.courtRating.upsert({
      where: {
        userId_courtId: { userId, courtId },
      },
      update: { rating },
      create: { userId, courtId, rating },
    });

    // Alle Bewertungen für den Court laden
    const allRatings = await prisma.courtRating.findMany({
      where: { courtId },
    });

    // Durchschnitt berechnen
    const averageRating =
      allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    // Court mit neuen Werten updaten
    await prisma.court.update({
      where: { id: courtId },
      data: {
        averageRating,
        checkinCount: allRatings.length,
      },
    });

    res.status(200).json({ averageRating, checkinCount: allRatings.length });
  } catch (error) {
    console.error('Fehler beim Speichern der Bewertung:', error);
    res.status(500).json({ message: 'Bewertung konnte nicht gespeichert werden.' });
  }
});



// POST /api/courts/:id/reviews → Review speichern
router.post('/:id/reviews', async (req, res) => {
  const courtId = parseInt(req.params.id);
  const { rating, reviewText } = req.body;

  if (!rating || !reviewText) {
    return res.status(400).json({ message: 'Bewertung und Text erforderlich' });
  }

  try {
    const review = await prisma.review.create({
      data: {
        courtId,
        rating,
        comment: reviewText, // ✅ Richtiges Feld verwenden
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('❌ Fehler beim Speichern der Review:', error);
    res.status(500).json({ message: 'Review konnte nicht gespeichert werden.' });
  }
});


// GET /api/courts/:id/reviews → Alle Reviews für einen Court
router.get('/:id/reviews', async (req, res) => {
  const courtId = parseInt(req.params.id);

  try {
    const reviews = await prisma.review.findMany({
      where: { courtId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error('❌ Fehler beim Laden der Reviews:', error);
    res.status(500).json({ message: 'Reviews konnten nicht geladen werden.' });
  }
});

// Beispiel mit Express + Prisma
router.post('/:id/rate', async (req, res) => {
  const courtId = parseInt(req.params.id);
  const { rating, userId } = req.body;  // UserId vom Frontend oder aus Auth-Token

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Ungültige Bewertung' });
  }

  try {
    // Court existiert prüfen
    const court = await prisma.court.findUnique({ where: { id: courtId } });
    if (!court) return res.status(404).json({ message: 'Court nicht gefunden' });

    // User-Bewertung erstellen oder updaten
    await prisma.courtRating.upsert({
      where: {
        userId_courtId: { userId, courtId }
      },
      update: { rating },
      create: { userId, courtId, rating },
    });

    // Alle Bewertungen für Court neu laden
    const allRatings = await prisma.courtRating.findMany({
      where: { courtId }
    });

    // Durchschnitt berechnen
    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    // Court aktualisieren
    await prisma.court.update({
      where: { id: courtId },
      data: {
        averageRating,
        checkinCount: allRatings.length,
      }
    });

    res.status(200).json({ averageRating, checkinCount: allRatings.length });
  } catch (error) {
    console.error('Fehler beim Speichern der Bewertung:', error);
    res.status(500).json({ message: 'Bewertung konnte nicht gespeichert werden.' });
  }
});

// GET /api/courts/user-ratings?userId=3
router.get('/user-ratings', async (req, res) => {
  const userId = parseInt(req.query.userId);
  if (!userId) {
    return res.status(400).json({ message: 'UserId ist erforderlich' });
  }

  try {
    const ratings = await prisma.courtRating.findMany({
      where: { userId },
      select: {
        courtId: true,
        rating: true,
      },
    });

    res.status(200).json(ratings);
  } catch (error) {
    console.error('❌ Fehler beim Abrufen der User-Ratings:', error);
    res.status(500).json({ message: 'Konnte Bewertungen nicht laden' });
  }
});





export default router;
