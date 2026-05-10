const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const passport = require('passport'); // ← change this line
const { login, register } = require('../controllers/authController');

// Existing routes
router.post('/login',    login);
router.post('/register', register);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed` }),
  async (req, res) => {
    try {
      const token = jwt.sign(
        { userId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '365d' }
      );

      const user = {
        id:     req.user._id,
        email:  req.user.email,
        name:   req.user.name,
        avatar: req.user.avatar,
      };

      res.redirect(
        `${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`
      );

    } catch (err) {
      console.log('Google callback error:', err.message);
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
  }
);

module.exports = router;