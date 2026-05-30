const setAuth = (req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;

  next();
};

module.exports = setAuth