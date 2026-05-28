const { Router } = require("express");
const homePageController = require("../controllers/home-page-controller");
const signup = require("../controllers/sign-up-controller");
const loginController = require("../controllers/log-in-controller");
const logoutController = require("../controllers/log-out-controller");

const isAuthenticatedController = require("../controllers/is-authenticated-controller");
const folderController = require("../controllers/folder-controller");
const fileController = require("../controllers/file-controller");
const share = require("../controllers/share-controller");

const router = Router();

// Routes that are allowed to run without login in (authentication)

router.get("/log-in", loginController);

router.get("/sign-up", signup.getController);

router.post("/sign-up", signup.postController);

router.get("/share/:folderId", share.getController);

router.post("/share", share.postController);
// Authentication

router.use(isAuthenticatedController);

// Routes to run after authentication

router.get("/", homePageController);

router.get("/log-out", logoutController);

// post routes

router.post("/folder", folderController);

router.post("/file", fileController);

// delete router

// router.delete("/message/:id", deleteMessageController);

module.exports = router;
