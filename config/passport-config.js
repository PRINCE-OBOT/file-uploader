const bcrypt = require("bcryptjs");
const { prisma } = require("../lib/prisma");
const LocalStrategy = require("passport-local").Strategy;

const localStrategy = () => {
  // run when user login
  return new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: {
            email: email
          }
        });

        if (!user) {
          return done(null, false);
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match)
          return done(null, false);

        return done(null, user); // call serializeUser
      } catch (err) {
        return done(err);
      }
    }
  );
};

const serializeUser = (user, done) => {
  done(null, user.id); // run when user login
};

const deserializeUser = async (id, done) => {
  // run when user hit different routes
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id
      }
    });

    if (!user) return done(null, false);

    return done(null, user);
  } catch (err) {
    return done(err);
  }
};

module.exports = {
  localStrategy,
  serializeUser,
  deserializeUser
};
