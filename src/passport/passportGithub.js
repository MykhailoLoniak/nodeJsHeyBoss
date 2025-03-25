require("dotenv").config();
const passport = require("passport");
const { Strategy: GitHubStrategy } = require("passport-github2");
const fetch = require("node-fetch");
const { User } = require("../models/user");
const userServices = require("../services/userService");
const { ApiError } = require("../exceptions/api.error");

async function getGitHubEmail(accessToken) {
  try {
    const response = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    const emails = await response.json();
    const primaryEmail = emails.find(email => email.primary && email.verified);
    return primaryEmail ? primaryEmail.email : null;
  } catch (error) {
    console.error("Error fetching GitHub email:", error);
    return null;
  }
}

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_ORIGIN}/api/auth/github/callback`,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("GitHub profile:", profile);
      try {
        let email = profile.emails?.[0]?.value || await getGitHubEmail(accessToken);

        if (!email) {
          throw new ApiError(400, "GitHub email not provided");
        }

        const user = await userServices.findByEmail(email);
        if (!user) {
          const user = {
            email: profile.emails[0]?.value || await getGitHubEmail(accessToken),
            profile_picture: profile.avatar_url ? profile.avatar_url : null
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
  done(null, user);
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
