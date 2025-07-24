// newsletterRoutes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Ungültige E-Mail' });
  }

  try {
    // In DB speichern
    await prisma.newsletterSubscriber.create({
      data: { email },
    });

    // Optional: Weiterleitung an E-Mail-Adresse
    const transport = nodemailer.createTransport({
      service: 'Gmail', // oder SMTP z. B. Webgo
      auth: {
        user: 'atm-3@msn.com',
        pass: process.env.MAIL_PASSWORD,
      },
    });

    await transport.sendMail({
      from: '"Newsletter" <aetugbo@gmail.com>',
      to: 'atm-3@msn.com',
      subject: 'Neue Newsletter-Anmeldung',
      text: `Neue Anmeldung: ${email}`,
    });

    res.status(200).json({ message: 'Erfolgreich abonniert!' });
  } catch (error) {
    console.error('Newsletter Fehler:', error);
    res.status(500).json({ error: 'Eintrag fehlgeschlagen' });
  }
});

export default router;
