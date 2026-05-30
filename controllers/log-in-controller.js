const loginController = (req, res) => {
  res.render("index", {
    title: "Log-in",
    pageTemplate: "login",
    email: req.flash("email")
  });
};

module.exports = loginController;
