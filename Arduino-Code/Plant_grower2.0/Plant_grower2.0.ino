#include <ArduinoJson.h>
#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "Bunker2019";
const char* password =  "fancy";
const char* mqttServer = "192.168.1.98";
const int mqttPort = 1883;

// Variables
long randNumber;
long randNumber2;
long randNumber3;
long lastMsg = 0;
char msg[50];
int state = LOW;
float soil_moisture = 0;

// Sensors
const int ledPin = 2; // LED Pin
const int water_pump = 23; // Water Pump
const float sensor_pin = 36;// Soil moisture

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {

  Serial.begin(115200);
  Serial.println();
  setup_wifi();
  Serial.println("Connected to the WiFi network");
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);
  pinMode(ledPin, OUTPUT);
  pinMode(water_pump, OUTPUT);
}

void loop() {

  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  long now = millis();
  if (now - lastMsg > 5000) {
    lastMsg = now;

    const int capacity = JSON_OBJECT_SIZE(3);
    StaticJsonDocument<capacity> doc;

    randNumber = random(300);
    randNumber2 = random(300);
    randNumber3 = random(300);

    doc["soil"] = randNumber;
    doc["light"] = randNumber2;
    doc["temp"] = randNumber3;

    char dataBuffer[100];
    serializeJson(doc, dataBuffer);
    //dtostrf(randNumber, 1, 2, dataBuffer);
    Serial.println("Sending message to MQTT topic..");
    Serial.println(dataBuffer);
    client.publish("esp32/humidity", dataBuffer);

    client.loop();
    Serial.println("-------------");
    sending_flag();
  }
}

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

  if (String(topic) == "esp32/output") {
    if (messageTemp == "on") {
      //refresh_plant();
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
      client.subscribe("esp32/output");
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

  for (int i = 0; i <= 3; i++) {
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
