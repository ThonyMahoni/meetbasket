import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import prisma from '../src/prisma.js'; 
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 300 }); // ⏱ z. B. 5 Min Cache für Sessions


dotenv.config();


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://meetbasket.com//api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.emails[0].value },
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        // Falls noch kein User existiert, erstelle einen neuen
        const newUser = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            username: profile.displayName.replace(/\s+/g, '').toLowerCase(),
            profile: {
              create: {
               name: profile.displayName
              },
            },
          },
        });
        cache.set(`session_user_${user.id}`, user);


        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const cachedUser = cache.get(`session_user_${id}`);
  if (cachedUser) return done(null, cachedUser); // ⚡ Cache-Hit

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) cache.set(`session_user_${id}`, user); // ✅ speichern
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

