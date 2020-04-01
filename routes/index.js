const router = require("express").Router();
const upload = require("multer")();
const { verifyToken } = require("../middlwares/token");

const helperController = require("../controllers/helper");
const helpController = require("../controllers/help");

// Create a new helper
router.route("/helper").post(upload.none(), helperController.registerHelper);

// Login
router.route("/login").post(upload.none(), helperController.login);

// Report help
router.route("/report").post(upload.none(), helpController.reportHelp);

// Help
router.route("/help").post(verifyToken, upload.none(), helpController.help);

module.exports = router;
