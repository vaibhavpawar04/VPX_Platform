const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { setupNewUser } = require('../controllers/authController');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      console.log(`Google login: existing user ${user.email}`);
      await setupNewUser(user._id);
      return done(null, user);
    }

    user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      await User.updateOne(
        { _id: user._id },
        {
          googleId: profile.id,
          authType: 'google',
          avatar:   profile.photos[0]?.value,
          name:     profile.displayName,
        }
      );
      const updatedUser = await User.findById(user._id);
      await setupNewUser(updatedUser._id);
      console.log(`Google login: linked to existing user ${updatedUser.email}`);
      return done(null, updatedUser);
    }

    user = await User.create({
      googleId:  profile.id,
      email:     profile.emails[0].value,
      name:      profile.displayName,
      avatar:    profile.photos[0]?.value,
      authType:  'google',
    });
    await setupNewUser(user._id);
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
