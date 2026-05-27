const bcrypt = require("bcryptjs");
const { body, validationResult, matchedData } = require("express-validator");
const { prisma } = require("../lib/prisma");

const alphaErr = "must contain only letters";
const lengthErr = "must be between 1 and 10 characters";

const validateSignUp = [
  body("firstName")
    .trim()
    .isAlpha()
    .withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`First name ${lengthErr}`),
  body("lastName")
    .trim()
    .isAlpha()
    .withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`Last name ${lengthErr}`),
  body("email").trim().isEmail().withMessage("Enter a valid email address"),
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters"),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      console.log(req.body.password, value);
      throw new Error("Passwords do not match");
    }
    return true;
  })
];

const postController = [
  validateSignUp,
  async (req, res) => {
    const errors = validationResult(req);

    const { firstName, lastName, email, password, confirmPassword } =
      matchedData(req);

    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (user) {
      return res.status(401).json({
        errors: [{ msg: "Email already exist" }],
        firstName,
        lastName,
        email,
        password,
        confirmPassword
      });
      // return res.status(401).render("index", {
      //   title: "Sign Up",
      //   pageTemplate: "sign-up",
      //   errors: [{ msg: "Email already exist" }],
      //   firstName,
      //   lastName,
      //   email,
      //   password,
      //   confirmPassword
      // });
    }

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        firstName,
        lastName,
        email,
        password,
        confirmPassword
      });
      // return res.status(400).render("index", {
      //   title: "Sign Up",
      //   pageTemplate: "sign-up",
      //   errors: errors.array(),
      //   firstName,
      //   lastName,
      //   email,
      //   password,
      //   confirmPassword
      // });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        password: hashedPassword,
        email
      }
    });

    res.redirect("/log-in");
    // res.render("index", { title: "Log in", pageTemplate: "login" });
  }
];

const getController = (req, res) => {
  res.json({ message: "Sign up page" });
  // res.render("index", { title: "Sign Up", pageTemplate: "sign-up" });
};

module.exports = { getController, postController };
