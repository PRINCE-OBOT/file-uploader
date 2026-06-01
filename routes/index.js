const { Router } = require("express");
const homePageController = require("../controllers/home-page-controller");
const signup = require("../controllers/sign-up-controller");
const loginController = require("../controllers/log-in-controller");
const logoutController = require("../controllers/log-out-controller");

const isAuthenticatedController = require("../controllers/is-authenticated-controller");
const folder = require("../controllers/folder-controller");
const file = require("../controllers/file-controller");
const share = require("../controllers/share-controller");

const router = Router();

// Routes that are allowed to run without login in (authentication)

router.get("/log-in", loginController);

router.get("/sign-up", signup.getController);

router.post("/sign-up", signup.postController);

router.get("/share/:id", share.getController);

// Authentication

router.use(isAuthenticatedController);

// Routes to run after authentication

router.get("/", homePageController);

router.get("/log-out", logoutController);

router.get("/folder/:folderId", folder.getController);

router.get("/folder", folder.getAllController);

router.get("/file/:fileId", file.getController);

router.get("/file", file.getAllController);

router.get("/log-out", logoutController);

// post routes

router.post("/folder", folder.postController);

router.post("/file", file.postController);

router.post("/share", share.postController);

// update routes

router.put("/folder", folder.updateController);

router.put("/file/:fileId", file.updateController);

// delete routes

router.delete("/folder", folder.deleteController);

router.delete("/file/:fileId", file.deleteController);

module.exports = router;
