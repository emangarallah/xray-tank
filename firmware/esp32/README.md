# ESP32 sensor node

This firmware sends calibrated water-level measurements to X-Ray Tank over Wi-Fi/HTTPS. The phone does not connect to the sensor by wire.

## Wiring
- JSN-SR04T VCC -> suitable 5V supply (verify the exact board revision).
- GND -> common GND.
- TRIG -> ESP32 GPIO 5.
- ECHO -> GPIO 18 **through a voltage divider or logic-level shifter**. ESP32 GPIO is not 5V tolerant.
- Power the ESP32 and sensor from a suitable regulated supply. Protect the electronics from moisture.

## Provision the device
1. Create an account at https://xray-tank-emicode.vercel.app/auth.
2. From the dashboard, create a tank. The app creates a unique tank ID and a random device key.
3. Copy the device key immediately. It is shown once only.
4. Set WIFI_SSID, WIFI_PASSWORD, API_URL, DEVICE_ID, and DEVICE_KEY in the sketch.
5. Add the trusted root CA certificate for the production HTTPS host. TLS verification must remain enabled.
6. Flash the ESP32 and confirm HTTP status 201 in Serial Monitor.

The device key is unique per tank. Do not share it or commit it to Git. If exposed, it must be considered compromised.

## Calibration
Measure the sensor-to-water distance with the tank empty and full. Set EMPTY_DISTANCE_CM and FULL_DISTANCE_CM accordingly. This starter assumes a vertical tank and a flat water surface. Verify at several known levels before relying on the percentage. Foam, turbulence, condensation, angled surfaces, and sensor dead zones can cause bad readings.

## Safety
This is a monitoring prototype. Do not use it as the sole protection for a pump, dry-run condition, or overflow. Use an independent, certified high-level cutoff and electrical protection.
