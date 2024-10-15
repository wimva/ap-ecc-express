import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import mongoStore from 'connect-mongo';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import testRoute from './routes/test.js';
import indexRoute from './routes/index.js';
import messagesRoute from './routes/messages.js';
import userRoute from './routes/users.js';

dotenv.config();

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));

app.use(
  session({
    store: mongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 72 * 60 * 60 * 1000, // 3 days in milliseconds
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://ap-ecc-express.onrender.com/auth/google/callback'
},
(accessToken, refreshToken, profile, done) => {
  console.log(profile);
  return done(null, profile);
}));

app.use('/', indexRoute);
app.use('/test', testRoute);
app.use('/messages', messagesRoute);
app.use('/users', userRoute);

// Redirects to Google for authentication
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google will redirect to this URL after successful authentication
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const user = req.user;
    // Redirect back to the Expo app with user details
    res.redirect(`testapp://callback?user=${encodeURIComponent(user.displayName)}`);
  }
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
