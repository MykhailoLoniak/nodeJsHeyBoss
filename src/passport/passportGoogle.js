require("dotenv").config();
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");

const userServices = require("../services/userService");
const { ApiError } = require("../exceptions/api.error");
const { User } = require("../models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_ORIGIN}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await userServices.findByEmail(profile.emails[0].value);

        if (!user) {
          const user = {
            email: profile.emails[0].value,
            profile_picture: profile.photos ? profile.photos[0].value : null
          }

          return done(null, user);
        }

        if (user.activation_token) {
          throw ApiError.forbidden("Confirm your email");
        }

        return done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
});

module.exports = passport;
