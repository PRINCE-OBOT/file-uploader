const loginController = (req, res) => {
  res.render("index", { title: "Log-in", pageTemplate: "login" });
  // ("index", { title: "Log-in", pageTemplate: "login" });
};

module.exports = loginController;
