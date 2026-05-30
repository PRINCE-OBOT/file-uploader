const setAuth = (req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user;

  next();
};

module.exports = setAuth