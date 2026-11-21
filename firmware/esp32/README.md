# ESP32 sensor node

This example is for an ESP32 + JSN-SR04T ultrasonic distance sensor. It sends readings to the X-Ray Tank HTTPS API over Wi-Fi; no cable connects the phone to the tank.

## Wiring (sensor to ESP32)
- VCC -> 5V/VIN (check your sensor board's rated supply)
- GND -> GND
- TRIG -> GPIO 5
- ECHO -> GPIO 18 **through a voltage divider or level shifter**. ESP32 GPIO is not 5V tolerant.
- Mount the sensor above the water, pointing down. Keep it protected from condensation and splashes.

The ESP32 board needs its own suitable power supply. This is independent of the phone and sensor signal is wireless.

## Configure
Install the **ArduinoJson** library from Arduino Library Manager. Open `xray_tank_esp32.ino` and set Wi-Fi name/password, API URL, device key, and the root CA certificate for your deployed HTTPS host. Never commit real credentials or production device keys. The sketch intentionally refuses insecure TLS.

Register the tank in Neon first:
`INSERT INTO tanks (id, name, capacity_liters) VALUES ('tank-001', 'Main Tank', 2000);`

Calibrate empty/full distances and tank geometry before using level values. This starter assumes a vertical tank and maps measured distance between those two calibration points to a percentage. Test with known water levels. Ultrasonic sensors can misread foam, turbulence, condensation, or angled surfaces.

Do not connect this prototype to a pump or rely on it for overflow prevention.
