require("dotenv").config();
const passport = require("passport");
const { Strategy: GitHubStrategy } = require("passport-github2");
const { User } = require("../models/user");
const userServices = require("../services/userService");
const { ApiError } = require("../exceptions/api.error");

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3005/api/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('profile________________________________:', profile);


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
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  try {
    const user = await User.findByPk(id);
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
});

module.exports = passport;
