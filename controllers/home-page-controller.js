const { format } = require("date-fns");

const homePageController = async (req, res) => {
  const user = req.user;

  res.json({
    message: "You are log in",
    user
  });

  // res.render("index", {
  //   title: "Club house",
  //   pageTemplate: "messages",
  //   user,
  //   rows,
  //   format
  // });
};

module.exports = homePageController;
