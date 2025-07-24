// routes/contact.js
import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'aetugbo@gmail.com',
        pass: 'yysd nmez xkqo yjso'
      },
    });

    await transporter.sendMail({
      from: email,
      to: 'atm-3@msn.com',
      subject: `Kontaktformular: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email-Fehler:', err);
    res.status(500).json({ error: 'Email konnte nicht gesendet werden.' });
  }
});

export default router;
