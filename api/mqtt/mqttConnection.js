const mqtt = require("mqtt");
const mongoose = require("mongoose");
const cron = require('node-cron');
const PlantStatus = require("../models/status");
const mqttUri ="mqtt://" + process.env.MQTT_HOSTNAME + ":" + process.env.MQTT_PORT; // Mqtt URI
const mqtt_client = mqtt.connect(mqttUri); // Mqt Client

const On = "on";
const Off = "off";
const bumpChannel = "esp32/bump";
const growLightChannel = "esp32/light";

// Subscribe to mqtt topic
exports.connect = function() {
  mqtt_client.on("connect", function() {
    mqtt_client.subscribe(process.env.MQTT_STATUS_CHANNEL);
    //waterPlant(bumpChannel, On);
    growLight(growLightChannel, Off);
    // startLightCycle();
    // finishLightCycle();
  });
};

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
        console.log(result);
        console.log("Data inserted!");
      })
      .catch(err => {
        console.log(err);
      });
  });
};

function waterPlant(topic, messa) {
  if (mqtt_client.connected == true) {
    var counter = 0;
    var i = setInterval(function() {
      console.log("Watering plant", messa);
      mqtt_client.publish(topic, messa);

      counter++;
      if (counter === 4) {
        clearInterval(i);
      }
    }, 5000);
  }
}

function growLight(topic, messa) {
  if (mqtt_client.connected == true) {
    console.log("Turn on light", messa);
    mqtt_client.publish(topic, messa);
  }
}

function startLightCycle (){
  cron.schedule('31 17 * * *', () => {
    growLight(growLightChannel, On);
  }, {
    scheduled: true,
    timezone: "America/Lima"
  });
}

function finishLightCycle (){
  cron.schedule('31 5 * * *', () => {
    growLight(growLightChannel, Off);
  }, {
    scheduled: true,
    timezone: "America/Lima"
  });
}