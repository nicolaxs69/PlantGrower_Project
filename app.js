require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

// Routes
const routes = require("./api/routes");
const mqtt = require("./api/mqtt/mqttConnection");

// App execution
app.use(morgan("dev"));
app.use('/uploads',  express.static("uploads")); //http://localhost:3000/uploads/2019-06-01T01:20:17.895Zaji.png
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Routes wich should handle requests
app.use(routes);

// Connect DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true
});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Server running");
});

mqtt.connect();
mqtt.insertData();

module.exports = app;
