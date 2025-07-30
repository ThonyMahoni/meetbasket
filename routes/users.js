import express from 'express';
import prisma from '../src/prisma.js'; 
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 60 }); // TTL = 60 Sekunden


const router = express.Router();


// GET /api/users – Alle Nutzer abrufen
router.get('/', async (req, res) => {
  const cachedUsers = cache.get('all_users');

  if (cachedUsers) {
    return res.json(cachedUsers); // Cache-Hit 🎯
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true, 
        email: true,
        skillLevel: true,
        position: true,
        isPremium: true,
        createdAt: true
      },
    });

    cache.set('all_users', users); // Cache speichern ✅
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

  const cacheKey = `user_${userId}`;
  const cachedUser = cache.get(cacheKey);

  if (cachedUser) {
    return res.json(cachedUser); // Cache-Hit 🎯
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

    cache.set(cacheKey, user); // Cache speichern ✅
    res.json(user);
  } catch (error) {
    console.error('❌ Fehler beim Abrufen des Nutzers:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen des Nutzers' });
  }
});


  

export default router;
