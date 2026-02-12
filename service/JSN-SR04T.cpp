#include <WiFi.h>
#include <HTTPClient.h>

// Configuration
const char* ssid = "WIFI_CAMEROUN_AGENCE";
const char* password = "MOT_DE_PASSE";
const char* serverUrl = "https://votre-domaine-erp.com/api/sensor/citerne-reading";
const char* sensorToken = "CITERNE_YAOUNDE_01"; // Identifiant unique de cette sonde

// Pins du capteur ultrason
const int trigPin = 5;
const int echoPin = 18;

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connexion au WiFi...");
  }
}

void loop() {
  // 1. Mesure de la distance
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  long duration = pulseIn(echoPin, HIGH);
  float distanceCm = duration * 0.034 / 2;

  // 2. Envoi vers Laravel
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Création du JSON : {"sensor_token": "...", "distance_cm": 120}
    String jsonPayload = "{\"sensor_token\":\"" + String(sensorToken) + "\", \"distance_cm\":" + String(distanceCm) + "}";
    
    int httpResponseCode = http.POST(jsonPayload);
    
    if(httpResponseCode > 0){
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
    }
    http.end();
  }
  
  // Attendre 5 minutes avant la prochaine mesure
  delay(300000); 
}