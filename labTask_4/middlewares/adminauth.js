module.exports = async function (req, res, next) {
    /* user = req.session.user;
    if (console.log(user)) {
        res.flash("danger", "Only admin is allowed to access");
        return res.redirect("/");
      } */
    next();
  };