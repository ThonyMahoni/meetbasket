// middleware/auth.js
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token fehlt oder ungültig' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Benutzer anhand von ID oder Email laden (je nach Login-Typ)
    const user = await prisma.user.findUnique({
      where: decoded.userId
        ? { id: decoded.userId }
        : decoded.email
        ? { email: decoded.email }
        : null,
    });

    if (!user) {
      return res.status(401).json({ error: 'Benutzer nicht gefunden' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('JWT-Fehler:', err);
    res.status(401).json({ error: 'Token ungültig oder abgelaufen' });
  }
};
