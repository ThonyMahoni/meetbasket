import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5174/api/auth/google/callback',
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
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});
