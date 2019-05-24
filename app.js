require('dotenv').config()
const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

// Routes
const plantStatusRoutes = require("./api/routes/plantStatus");

// Connect DB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true })

// App execution
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Routes wich should handle requests
app.use("/plantStatus", plantStatusRoutes);

app.use((req, res, next) => {
  const error = new Error("NOT FOUND");
  error.status(404);
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
