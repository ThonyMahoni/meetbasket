import express from 'express';
import cors from 'cors';
//import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './authRoutes.js';
import gamesRoutes from './gamesRoutes.js'; // wenn du sie nutzt
import courtsRoutes from './courtsRoutes.js';
import games from './routes/games.js'; // <-- DEIN neuer Game Router
import playersRoutes from './playersRoutes.js';
import fetch from 'node-fetch';
import teamsRoutes from './routes/teams.js';
import tournamentsRoutes from './routes/tournaments.js';
import teamCreateRoutes from './routes/create.js'; // Pfad anpassen
import createTeamRoute from './routes/create.js';
import usersRoutes from './routes/users.js'; // ✅ neu eingebunden
import playerRatingRoute from './routes/player.js';
import gamesRouter from './routes/games.js';
import messagesRouter from './routes/messages.js';
import friendsRouter from './routes/friends.js';
import premiumRoutes from './routes/premium.js';
import subscribeRouter from './routes/premium/subscribe.js';
import profileRoutes from './routes/profile.js';
import contactRoutes from './routes/contact.js';
import passport from 'passport';
import newsletterRoutes from './routes/newsletterRoutes.js';

import homeRoute from './routes/activity.js';
import settingsRoutes from './routes/settings.js';

//import session from 'express-session'; // Falls du später Sessions brauchst


dotenv.config();

import './routes/passport.js'; // <-- deine Passport-Konfiguration
const app = express();

// 👉 JSON & URL-encoded mit höherem Limit

// Middleware vor den Routen!
app.use(cors({ origin: 'https://meetbasket.com', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// API-Routen einhängen
app.use('/api/games', gamesRoutes); // reicht völlig
app.use('/api/courts', courtsRoutes);
app.use('/api', authRoutes);
app.use('/api/games', games); 
app.use('/api/players', playersRoutes);
app.use('/api/teams', teamsRoutes); 
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api', teamCreateRoutes);
app.use('/api/teams', createTeamRoute); // führt zu /api/teams/create
app.use('/api/users', usersRoutes); // ✅ /api/users verfügbar
app.use('/api/player', playerRatingRoute);
app.use('/api/games', gamesRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/premium', premiumRoutes);
app.use('/api/premium/subscribe', subscribeRouter); 
app.use('/api/profile', profileRoutes);
app.use('/avatars', express.static('public/avatars'));
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);
app.use('/api/activity', homeRoute);
app.use('/api/newsletter', newsletterRoutes);

app.use('/api/settings', settingsRoutes);

// /api/reverse-geocode?lat=48.266&lng=10.991
app.get('/api/reverse-geocode', async (req, res) => {
    const { lat, lng } = req.query;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCltQmhBLGhklgrdMaiIm4Om-zOFQDMfXI`
    );
    const data = await response.json();
    res.json(data);
  });
  
app.get('/', (req, res) => {
  res.send('<h2>🏀 BasketballConnect Backend läuft!</h2><p>API läuft unter <code>/api</code>.</p>');
});

const PORT = 3306;
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
