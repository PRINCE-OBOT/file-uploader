const express = require("express");
const session = require("express-session");

const { join } = require("path");
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
const methodOverride = require("method-override");

const router = require("./routes/index");

const loginController = require("./controllers/log-in-controller");
const errorController = require("./controllers/error-controller");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportConfig = require("./config/passport-config");

const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { prisma } = require("./lib/prisma");
const setAuth = require("./controllers/set-auth-controller");
const setLoginError = require("./controllers/set-login-error-controller");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.set("trust proxy", 1);

app.use(
  session({
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // prune expired sessions every 2 mins
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
  })
);

app.use(passport.session());

app.use(setAuth);

app.use(express.urlencoded({ extended: false }));

app.use(flash());

app.use(setLoginError);

app.use(methodOverride("_method"));

app.post("/log-in", (req, res, next) => {
  req.flash("email", req.body.email);

  passport.authenticate("local", {
    successRedirect: "/homepage",
    failureRedirect: "/log-in",
    failureFlash: "Incorrect email or password"
  })(req, res, next);
});

app.use("/", router);

passport.use(passportConfig.localStrategy());

passport.serializeUser(passportConfig.serializeUser);

passport.deserializeUser(passportConfig.deserializeUser);

app.use((req, res) => {
  res.status(404).json({
    message: "You seen to have entered the wrong path. path does not exist"
  });
});

app.use(errorController);

// prisma script
async function main() {
  const folder = await prisma.file.findMany({
    where: {}
  });

  // console.log(folder);
}

main();

if (require.main === module) {
  app.listen(PORT, (error) => {
    if (error) throw error;
    console.log(`App listening on port ${PORT}!`);
  });
}

module.exports = app;
