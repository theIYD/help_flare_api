const router = require("express").Router();
const upload = require("multer")();

const helperController = require("../controllers/helper");

// Create a new helper
router.route("/helper").post(upload.none(), helperController.registerHelper);

module.exports = router;
