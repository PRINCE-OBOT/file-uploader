const homePageController = async (req, res) => {
  res.render("index", {
    title: "File Uploader",
    pageTemplate: "homepage",
  });
};

module.exports = homePageController;
