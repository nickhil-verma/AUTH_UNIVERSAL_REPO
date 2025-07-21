const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const jwt = require("jsonwebtoken");
const User = require("./models/User");
require("dotenv").config();

const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET;

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user));
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value;
      const image = profile.photos?.[0]?.value || '';

      if (!email) return done(new Error("Google account has no email"));

      try {
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            username: profile.displayName.replace(/\s+/g, "").toLowerCase(),
            email,
            image,
            password: "",
            oauthProvider: "google",
          });
        } else if (!user.image && image) {
          user.image = image;
          await user.save();
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

        return done(null, {
          token,
          username: user.username,
          email: user.email,
          image: user.image,
        });
      } catch (err) {
        return done(err);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.find(e => e.verified)?.value || profile.emails?.[0]?.value;
      const image = profile.photos?.[0]?.value || '';

      if (!email) return done(new Error("GitHub account has no accessible email"));

      try {
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            username: profile.username.toLowerCase(),
            email,
            image,
            password: "",
            oauthProvider: "github",
          });
        } else if (!user.image && image) {
          user.image = image;
          await user.save();
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

        return done(null, {
          token,
          username: user.username,
          email: user.email,
          image: user.image,
        });
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Callback handler
const handleOAuthCallback = (req, res) => {
  const { token, username, email, image } = req.user;
  const redirectUrl = `${FRONTEND_URL}/login?token=${token}&username=${username}&email=${email}&image=${encodeURIComponent(image || '')}`;
  res.redirect(redirectUrl);
};

module.exports = { passport, handleOAuthCallback };
