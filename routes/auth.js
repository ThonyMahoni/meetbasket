// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      },
      include: { profile: true }
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Login fehlgeschlagen' });
  }
});

// Weiterleitung an Google zur Authentifizierung
router.get('/google-login', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // "Bearer xyz"

  if (!token) return res.status(401).json({ message: 'Kein Token vorhanden' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!req.user) return res.status(401).json({ message: 'Benutzer nicht gefunden' });

    next();
  } catch (err) {
    console.error('Token ungültig:', err);
    return res.status(403).json({ message: 'Token ungültig' });
  }
};

// Callback nach Google-Login
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  session: false
}), (req, res) => {
  // Nach erfolgreichem Login kannst du hier einen JWT setzen oder redirecten
  // Beispiel:
  res.redirect(`http://localhost:5174?user=${encodeURIComponent(JSON.stringify(req.user))}`);
});

export default router;
