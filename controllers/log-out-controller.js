const logoutController = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      throw new Error("Logout failed");
    }
    res.redirect("/log-in");
  });
};

module.exports = logoutController;
