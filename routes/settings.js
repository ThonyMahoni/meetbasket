import express from 'express';
import prisma from '../src/prisma.js'; 
import { authenticateUser } from '../middleware/auth.js';
import bcrypt from 'bcrypt';


const router = express.Router();


// Default-Werte für neue Benutzer
const DEFAULT_SETTINGS = {
  notifications: {
    gameInvites: true,
    courtUpdates: true,
    friendRequests: true,
    appUpdates: false,
  },
  privacy: {
    showProfile: 'everyone',
    showStats: 'everyone',
    locationSharing: 'while_using',
  },
  appearance: {
    darkMode: false,
    language: 'deutsch',
  }
};



// GET /api/settings
router.get('/', authenticateUser, async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Nicht autorisiert.' });
  }

  try {
    let settings = await prisma.settings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Erstellt einen neuen Settings-Eintrag mit Default-Werten, wenn noch nicht vorhanden
      settings = await prisma.settings.create({
        data: {
          userId,
          notifications: DEFAULT_SETTINGS.notifications,
          privacy: DEFAULT_SETTINGS.privacy,
          appearance: DEFAULT_SETTINGS.appearance,
        },
      });
    }

    res.json({
      notifications: settings.notifications,
      privacy: settings.privacy,
      appearance: settings.appearance,
    });
  } catch (err) {
    console.error('Fehler beim Laden der Einstellungen:', err);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// PUT /api/settings
router.put('/', authenticateUser, async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Nicht autorisiert' });
  }

  const { notifications, privacy, appearance } = req.body;

  try {
    const updatedSettings = await prisma.settings.upsert({
      where: { userId },
      update: {
        notifications,
        privacy,
        appearance,
      },
      create: {
        userId,
        notifications: notifications || DEFAULT_SETTINGS.notifications,
        privacy: privacy || DEFAULT_SETTINGS.privacy,
        appearance: appearance || DEFAULT_SETTINGS.appearance,
      },
    });

    res.json(updatedSettings);
  } catch (err) {
    console.error('Fehler beim Speichern:', err);
    res.status(500).json({ message: 'Fehler beim Speichern der Einstellungen' });
  }
});

// DELETE /api/settings/:userId
router.delete('/:userId', authenticateUser, async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (!userId) return res.status(400).json({ error: 'User-ID fehlt.' });

  try {
    await prisma.message.deleteMany({ where: { senderId: userId } });
    await prisma.profile.deleteMany({ where: { userId } });
    await prisma.settings.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    res.json({ success: true, message: 'Account erfolgreich gelöscht.' });
  } catch (error) {
    console.error('Fehler beim Löschen des Accounts:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Accounts' });
  }
});


// POST /api/settings/change-password
router.post('/change-password', authenticateUser, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Beide Passwörter sind erforderlich.' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  const passwordIsValid = await bcrypt.compare(oldPassword, user.password);
  if (!passwordIsValid) {
    return res.status(401).json({ message: 'Aktuelles Passwort ist falsch.' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  res.json({ message: 'Passwort wurde erfolgreich geändert.' });
});


export default router;
