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

import User from './models/User.js'; // Import User model

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
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: profile.emails[0].value });
    
    if (!user) {
      // Create a new user if not found
      user = new User({
        username: profile.displayName,
        name: profile.name.givenName,
        email: profile.emails[0].value,
      });
      await user.save();
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

app.use('/', indexRoute);
app.use('/test', testRoute);
app.use('/messages', messagesRoute);
app.use('/users', userRoute);

// Redirects to Google for authentication
app.get('/auth/google', (req, res, next) => {
  const redirectUri = req.query.redirectUri; // Allow redirect URI from the client
  if (redirectUri) {
    req.session.redirectUri = redirectUri; // Store in session for later use
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google will redirect to this URL after successful authentication
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const user = req.user;

    // Retrieve the redirect URI stored in the session
    const redirectUri = req.session.redirectUri || 'exp://localhost:19000'; // Use a default fallback URI
    const userInfo = {
      id: user._id, // Include user ID
      displayName: user.username,
      email: user.email,
    };

    // Redirect back to the Expo app with user information as query params
    const redirectUrl = `${redirectUri}?user=${encodeURIComponent(JSON.stringify(userInfo))}`;
    res.redirect(redirectUrl);
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
