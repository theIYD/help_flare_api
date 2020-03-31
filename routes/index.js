const router = require("express").Router();
const upload = require("multer")();

const helperController = require("../controllers/helper");

// Create a new helper
router.route("/helper").post(upload.none(), helperController.registerHelper);

// Login
router.route("/login").post(upload.none(), helperController.login);

module.exports = router;
