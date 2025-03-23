require("dotenv").config();
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { User } = require("../models/user");
const userServices = require("../services/userService");
const { ApiError } = require("../exceptions/api.error");




passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3005/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await userServices.findByEmail(profile.emails[0].value);

        if (!user) {
          throw ApiError.badRequest("No such user");
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
