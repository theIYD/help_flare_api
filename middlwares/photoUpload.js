const dotenv = require("dotenv").config();
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3Config = new AWS.S3({
  accessKeyId: process.env.S3_ACCESSKEY,
  secretAccessKey: process.env.S3_SECRETKEY,
  region: process.env.S3_REGION
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const multerS3Config = multerS3({
  s3: s3Config,
  bucket: process.env.S3_BUCKET_NAME + "/photos",
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    console.log("from multers3", file);
    cb(null, new Date().toISOString() + "-" + file.originalname);
  }
});

const upload = multer({
  storage: multerS3Config,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10 // we are allowing only 10 MB files
  }
});

exports.photo = upload;
