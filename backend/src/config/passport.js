const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      console.log(`Google login: existing user ${user.email}`);
      return done(null, user);
    }
    user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      user.googleId = profile.id;
      user.authType = 'google';
      user.avatar   = profile.photos[0]?.value;
      user.name     = profile.displayName;
      await user.save();
      console.log(`Google login: linked to existing user ${user.email}`);
      return done(null, user);
    }
    user = await User.create({
      googleId:  profile.id,
      email:     profile.emails[0].value,
      name:      profile.displayName,
      avatar:    profile.photos[0]?.value,
      authType:  'google',
    });
    console.log(`Google login: new user created ${user.email}`);
    return done(null, user);
  } catch (err) {
    console.log('Google OAuth error:', err.message);
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
