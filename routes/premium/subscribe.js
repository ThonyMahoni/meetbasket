import express from 'express';
import prisma from '../../src/prisma.js';

const router = express.Router();


router.post('/', async (req, res) => {
  const {
    userId,
    tier,
    fullName,
    email,
    address,
    city,
    country,
    zipCode,
    expiryDate,
    price,
  } = req.body;

  if (!userId || !tier || !email || !expiryDate) {
    return res.status(400).json({ error: 'Fehlende Pflichtfelder.' });
  }

  try {
    // 1. User als Premium markieren
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        isPremium: true,
        premiumUntil: new Date(expiryDate),
      },
    });

    // 2. Optional: Transaktion speichern
    await prisma.premiumTransaction.create({
      data: {
        userId: Number(userId),
        tier,
        price: Number(price),
        fullName,
        email,
        address,
        city,
        country,
        zipCode,
        expiryDate: new Date(expiryDate),
      },
    });

    // 3. Rückgabe des aktualisierten Nutzers
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Fehler bei der Premium-Transaktion:', err);
    res.status(500).json({ error: 'Interner Serverfehler beim Abschluss der Premium-Buchung.' });
  }
});

export default router;
