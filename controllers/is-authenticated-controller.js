function isAuthenticatedController(req, res, next) {
  const path = req.path;

  if (!req.isAuthenticated()) {
    return res.status(401).redirect('/log-in');
    //   .render("index", { title: "Log in", pageTemplate: "login" });
  }

  next();
}

module.exports = isAuthenticatedController;
