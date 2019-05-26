const mqtt = require("mqtt");
const mongoose = require("mongoose");

var mqttUri = "mqtt://" + process.env.MQTT_HOSTNAME + ":" + process.env.MQTT_PORT; // Mqtt URI
const mqtt_client = mqtt.connect(mqttUri); // Mqt Client
var message = "on"; // Mqtt pu
var topic = "esp32/output";

// Subscribe to mqtt topic
exports.connect = function() {
  mqtt_client.on("connect", function() {
    mqtt_client.subscribe(process.env.MQTT_NAMESPACE);
  });
}

exports.inserData = function() {
  mqtt_client.on("message", function(topic, message) {
    const obj = JSON.parse(message);

    const plantStatus = new PlantStatus({
      _id: new mongoose.Types.ObjectId(),
      soil: obj.soil,
      light: obj.light,
      temp: obj.temp
    });

    plantStatus
    .save()
    .then(result => {console.log(result)})
    .catch(err => {console.log(err)});
  });
}
