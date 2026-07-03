const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');

// Only register Google strategy if credentials are present
// (they won't be in CI/test environments)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const name = profile.displayName;

          let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

          if (result.rows.length === 0) {
            result = await pool.query(
              'INSERT INTO users (name, email, provider) VALUES ($1, $2, $3) RETURNING *',
              [name, email, 'google']
            );
          }

          return done(null, result.rows[0]);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

module.exports = passport;