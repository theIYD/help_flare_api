const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv").config();
const app = express();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(result => {
    console.log("Databse is connected");
  })
  .catch(err => console.log(err));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS"
  );
  next();
});
