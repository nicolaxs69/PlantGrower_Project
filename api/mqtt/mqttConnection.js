const mqtt = require("mqtt");
const mongoose = require("mongoose");

var mqttUri = "mqtt://" + process.env.MQTT_HOSTNAME + ":" + process.env.MQTT_PORT; // Mqtt URI
const mqtt_client = mqtt.connect(mqttUri); // Mqt Client
var message = "on"; // Mqtt pu
var topic = "esp32/output";

const PlantStatus = require("../models/status");


// Subscribe to mqtt topic
exports.connect = function() {
  mqtt_client.on("connect", function() {
    mqtt_client.subscribe(process.env.MQTT_NAMESPACE);
  });
}

exports.insertData = function() {
  mqtt_client.on("message", function(topic, message) {
    const obj = JSON.parse(message);
    const plantStatus = new PlantStatus({
      _id: new mongoose.Types.ObjectId(),
      moisture: obj.moisture,
      humidity: obj.humidity,
      temperature: obj.temperature
    });

    plantStatus
    .save()
    .then(result => {
      console.log(result)
      console.log('Data inserted!')
    })
    .catch(err => {console.log(err)});
  });
}

