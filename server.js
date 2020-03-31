const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv").config();
const app = express();

const routes = require("./routes/index");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(result => {
    console.log("Database is connected");
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

// CORS
app.use(cors());

// Home route
app.get("/", (req, res, next) => {
  res.json({
    error: 0,
    message: "COVID Help API"
  });
});

// Use all the routes
app.use("/", routes);

// Listen on a port
const port = process.env.PORT || 1100;
let server = app.listen(port, err => {
  if (err) {
    console.log(`Error while starting the server on port ${port}`);
  } else {
    console.log(`Server connected on port ${port}`);
  }
});
