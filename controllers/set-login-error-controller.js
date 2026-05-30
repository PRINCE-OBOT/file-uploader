const setLoginError = (req, res, next)=>{
  res.locals.error = req.flash('error')
  next()
}

module.exports = setLoginError