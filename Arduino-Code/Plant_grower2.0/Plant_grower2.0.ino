/*
  Plant Grower Project

  Turns an LED on for one second, then off for one second, repeatedly.

  Most Arduinos have an on-board LED you can control. On the UNO, MEGA and ZERO
  it is attached to digital pin 13, on MKR1000 on pin 6. LED_BUILTIN is set to
  the correct LED pin independent of which board is used.
  If you want to know what pin the on-board LED is connected to on your Arduino
  model, check the Technical Specs of your board at:
  https://www.arduino.cc/en/Main/Products


  by Nicolas Escobar Cruz

  This example code is in the public domain.

  http://www.arduino.cc/en/Tutorial/Blink
*/


//Libraries used
#include <ArduinoJson.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>


// Mqtt variables
const char* ssid = "Bunker2019";
const char* password =  "fancy";
const char* mqttServer = "192.168.1.98";
const int mqttPort = 1883;

//Variables
long randNumber;
long randNumber2;
long randNumber3;
long lastMsg = 0;
char msg[50];
int state = LOW;
float moisture_moisture = 0;

// Pin sensors
const int ledPin = 2; // LED Pin
const int lightPin = 32; // Growth light
const int water_pump = 23; // Water Pump
const float sensor_pin = 36;// moisture moisture
int soil_moisture = 0;


#define DHTPIN 23
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);


// Libraries client
WiFiClient espClient;
PubSubClient client(espClient);


void setup() {

  Serial.begin(115200);
  analogReadResolution(10);   // Set a 10 bit resolution for the analog input GPIO 36
  dht.begin();                 // Start Dht11 sensor
  pinMode(ledPin, OUTPUT);
  pinMode(lightPin, OUTPUT);
  pinMode(water_pump, OUTPUT);

  // Execute Esp32 mqtt connection to broker
  setup_wifi();

  Serial.println("Connected to the WiFi network");
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);
}

void loop() {

  //Retry connection when disconnected from broker
  if (!client.connected()) {
    client.disconnect();
    reconnect();
  }
  client.loop();

  // Loop every 5 sec, using the millis function (Better than delay, do not stop the Esp32 processing queue)
  long now = millis();
  if (now - lastMsg > 5000) {
    lastMsg = now;


    soil_moisture = analogRead(sensor_pin); // Soil moisture reading
    //Map reading format caibrated as: (sensorValue, min, max , 100%, 0%)
    int percentMoist = map(soil_moisture, 381, 810, 100, 0);

    float humidity = dht.readHumidity();   // Relative humidity reading
    float temperature = dht.readTemperature();       // Temperature reading

    // Check if there is something wrong with the reading
    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Error obteniendo los datos del sensor DHT11");
      return;
    }

    // Encapsule data readings in a JSON format and publish to the broker
    const int capacity = JSON_OBJECT_SIZE(3);
    StaticJsonDocument<capacity> doc;

    doc["moisture"] = percentMoist;
    doc["humidity"] = humidity;
    doc["temperature"] = temperature;

    char dataBuffer[100];
    serializeJson(doc, dataBuffer);
    Serial.println("Sending message to MQTT topic..");
    Serial.println(dataBuffer);
    client.publish("esp32/status", dataBuffer);

    client.loop();
    Serial.println("-------------");
    sending_flag();
  }
}

// Callback from broker. Here we recieved mesages sent from the broker server, and control things!
void callback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String messageTemp;

  for (int i = 0; i < length; i++) {
    Serial.print((char)message[i]);
    messageTemp += (char)message[i];
  }
  Serial.println();

  if (String(topic) == "esp32/bump") {
    if (messageTemp == "on") {
      //refresh_plant();
      Serial.println("hola");
    }
  }

  if (String(topic) == "esp32/light") {
    if (messageTemp == "on") {
      digitalWrite(lightPin, HIGH);
    } else {
      digitalWrite(lightPin, LOW);
    }
  }
}

void setup_wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}


void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP32Client")) {
      Serial.println("connected");
      connected_flag(15, 50);
      // Subscribe
      client.subscribe("esp32/bump");
      client.subscribe("esp32/light");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}


void sending_flag() {

  for (int i = 0; i <= 1; i++) {
    digitalWrite(ledPin, HIGH);   // turn the LED on (HIGH is the voltage level)
    delay(50);                       // wait for a second
    digitalWrite(ledPin, LOW);    // turn the LED off by making the voltage LOW
    delay(50);
  }
}

void connected_flag(int flashing, int timer) {
  for (int i = 0; i <= flashing; i++) {
    digitalWrite(ledPin, HIGH);   // turn the LED on (HIGH is the voltage level)
    delay(timer);                       // wait for a second
    digitalWrite(ledPin, LOW);    // turn the LED off by making the voltage LOW
    delay(timer);
  }
  digitalWrite(ledPin, HIGH);   // turn the LED on (HIGH is the voltage level)
  delay(1000);                       // wait for a second
  digitalWrite(ledPin, LOW);    // turn the LED off by making the voltage LOW
  delay(1000);
}

void refresh_plant() {
  for (int i = 0; i <= 35 ; i++) {
    digitalWrite(water_pump, HIGH);
    delay(100);
    digitalWrite(water_pump, LOW);
    delay(100);
  }
}
