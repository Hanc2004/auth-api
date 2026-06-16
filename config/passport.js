const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');

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

        // 1. Check if user already exists
        let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = result.rows[0];

        // 2. If not, create them
        if (!user) {
          const newUser = await pool.query(
            'INSERT INTO users (name, email, provider) VALUES ($1, $2, $3) RETURNING *',
            [name, email, 'google']
          );
          user = newUser.rows[0];
        }

        // 3. Pass the user along
        done(null, user);

      } catch (err) {
        done(err, null);
      }
    }
  )
);

// Required by Passport - saves user id into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Required by Passport - retrieves full user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;