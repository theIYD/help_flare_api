const fs = require("fs");
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv").config();
const app = express();

const routes = require("./routes/index");
const errorHandler = require("./middlwares/error");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log("Database is connected");
  })
  .catch((err) => console.log(err));

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

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a",
});

// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

// Home route
app.get("/", (req, res, next) => {
  res.json({
    error: 0,
    message: "COVID Help API",
  });
});

// Use all the routes
app.use("/api", routes);

// Error middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
});

// Listen on a port
const port = process.env.PORT || 1100;
let server = app.listen(port, (err) => {
  if (err) {
    console.log(`Error while starting the server on port ${port}`);
  } else {
    console.log(`Server connected on port ${port}`);
  }
});

const io = require("socket.io").listen(server);
const getHelpsSocket = require("./controllers/help");
io.sockets.on("connection", (socket) => {
  getHelpsSocket.getHelps(io, socket);
});
