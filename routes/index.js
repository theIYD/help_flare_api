const router = require("express").Router();
const upload = require("multer")();
const { verifyToken } = require("../middlwares/token");
const { photo } = require("../middlwares/photoUpload");

const helperController = require("../controllers/helper");
const helpController = require("../controllers/help");

// Create a new helper
router.route("/helper").post(upload.none(), helperController.registerHelper);

// Login
router.route("/login").post(upload.none(), helperController.login);

// Report help
router.route("/report_help").post(upload.none(), helpController.reportHelp);

// Help
router.route("/help").post(verifyToken, upload.none(), helpController.help);

// Help was delivered
router
  .route("/help/verify")
  .post(verifyToken, photo.single("photo"), helpController.helpDone);

// Profile
router
  .route("/profile")
  .get(verifyToken, upload.none(), helperController.profile);

module.exports = router;
