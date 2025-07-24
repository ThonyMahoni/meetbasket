import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './prisma/lib.js'; // <-- dein zentraler Prisma-Client
import passport from 'passport';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supergeheim';

// 📌 REGISTRIERUNG
router.post('/register', async (req, res) => {
  const { username, email, password, skillLevel = 3, position = 'guard' } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Benutzername oder E-Mail bereits vergeben.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        skillLevel,
        position,
        isPremium: false // ✅ explizit oder via default
      }
    });

    return res.status(201).json({
      message: 'Benutzer erfolgreich registriert.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error('❌ Fehler bei Registrierung:', err);
    return res.status(500).json({ message: 'Fehler bei Registrierung', detail: err.message });
  }
});

// 📌 LOGIN
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Falsches Passwort.' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login erfolgreich.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isPremium: user.isPremium // ✅ hier hinzufügen
      }
    });
  } catch (err) {
    console.error('❌ Fehler beim Login:', err);
    return res.status(500).json({ message: 'Fehler beim Login', detail: err.message });
  }
});


// Weiterleitung zu Google
router.get('/google-login', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: 'https://meetbasket.com/login',
  session: false,
}), (req, res) => {
  const user = req.user;

  const token = jwt.sign(
    {
      id: user.id,
      name: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.redirect(`https://meetbasket.com/auth-success?token=${token}`);
});




// Test
router.get('/test', (req, res) => {
  res.send('✅ Auth-API bereit');
});

export default router;
