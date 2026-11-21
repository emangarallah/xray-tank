#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Fill these locally. Do not commit real secrets.
const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* API_URL = "https://YOUR-VERCEL-DOMAIN/api/telemetry";
const char* DEVICE_KEY = "YOUR_DEVICE_API_KEY";
const char* DEVICE_ID = "tank-001";

// Paste the trusted root CA certificate for the HTTPS endpoint here.
static const char ROOT_CA[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
PASTE_TRUSTED_ROOT_CA_HERE
-----END CERTIFICATE-----
)EOF";

constexpr int TRIG_PIN = 5;
constexpr int ECHO_PIN = 18;
constexpr float EMPTY_DISTANCE_CM = 150.0; // calibrate for your tank
constexpr float FULL_DISTANCE_CM = 20.0;   // calibrate for your tank
constexpr unsigned long SEND_INTERVAL_MS = 30000;

float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(3);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  const unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000UL);
  if (duration == 0) return NAN;
  return duration * 0.0343f / 2.0f;
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWi-Fi connected");
}

void loop() {
  static unsigned long lastSend = 0;
  if (millis() - lastSend < SEND_INTERVAL_MS) { delay(100); return; }
  lastSend = millis();
  if (WiFi.status() != WL_CONNECTED) { WiFi.reconnect(); return; }

  const float distance = readDistanceCm();
  if (!isfinite(distance) || distance < 2.0f || distance > 450.0f) {
    Serial.println("Invalid ultrasonic reading; skipped");
    return;
  }
  const float raw = (EMPTY_DISTANCE_CM - distance) /
                    (EMPTY_DISTANCE_CM - FULL_DISTANCE_CM) * 100.0f;
  const float level = constrain(raw, 0.0f, 100.0f);

  WiFiClientSecure client;
  client.setCACert(ROOT_CA); // TLS verification stays enabled.
  HTTPClient https;
  if (!https.begin(client, API_URL)) { Serial.println("HTTPS init failed"); return; }
  https.addHeader("Content-Type", "application/json");
  https.addHeader("x-device-key", DEVICE_KEY);
  JsonDocument doc;
  doc["deviceId"] = DEVICE_ID;
  doc["levelPercent"] = level;
  doc["distanceCm"] = distance;
  String payload;
  serializeJson(doc, payload);
  const int code = https.POST(payload);
  Serial.printf("POST status: %d | level: %.1f%%\n", code, level);
  https.end();
  delay(10);
}
