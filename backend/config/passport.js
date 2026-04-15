const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8000/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // ---------------------------------------------------------
                // Step 1: Look for an existing user with this Google ID
                // ---------------------------------------------------------
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    // User has logged in with Google before — return them
                    return done(null, user);
                }

                // ---------------------------------------------------------
                // Step 2: No googleId match — check if the email exists
                // ---------------------------------------------------------
                const email = profile.emails && profile.emails[0]
                    ? profile.emails[0].value
                    : null;

                if (email) {
                    user = await User.findOne({ email });

                    if (user) {
                        // Email exists (local account) — link Google ID to it
                        user.googleId = profile.id;
                        user.avatarUrl = user.avatarUrl || (profile.photos && profile.photos[0]
                            ? profile.photos[0].value
                            : null);
                        await user.save();
                        return done(null, user);
                    }
                }

                // ---------------------------------------------------------
                // Step 3: Completely new user — create from Google profile
                // ---------------------------------------------------------
                const newUser = await User.create({
                    name: profile.displayName,
                    email: email,
                    googleId: profile.id,
                    avatarUrl: profile.photos && profile.photos[0]
                        ? profile.photos[0].value
                        : null,
                    role: 'student', // default role for new signups
                });

                return done(null, newUser);
            } catch (err) {
                console.error('Passport GoogleStrategy error:', err.message);
                return done(err, null);
            }
        }
    )
);

// ---- Serialization (needed if using sessions, but we use JWT) ----
// Minimal serialize/deserialize to satisfy Passport's internal contract.
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