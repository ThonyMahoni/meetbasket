import express from 'express';
import prisma from '../src/prisma.js'; 

const router = express.Router();


// GET /api/users – Alle Nutzer abrufen
router.get('/', async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,        // optional
          skillLevel: true,
          position: true,     // kannst du verwenden
          isPremium: true,
          createdAt: true     // optional
        },
      });
  
      res.json(users);
    } catch (error) {
      console.error('❌ Fehler beim Laden der Nutzer:', error);
      res.status(500).json({ error: 'Fehler beim Abrufen der Nutzer' });
    }
  });

 // GET /api/users/:id – Einzelnen Nutzer laden
router.get('/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Ungültige User-ID' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        skillLevel: true,
        position: true,
        isPremium: true
      }
    });

    if (!user) return res.status(404).json({ error: 'User nicht gefunden' });

    res.json(user);
  } catch (error) {
    console.error('❌ Fehler beim Abrufen des Nutzers:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen des Nutzers' });
  }
});

  

export default router;

  
 
  
