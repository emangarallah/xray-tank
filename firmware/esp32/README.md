# X-Ray Tank — ESP32 sensor node

This firmware sends real ultrasonic water-level measurements from an ESP32 to the X-Ray Tank website over Wi-Fi/HTTPS.

## Tank profile supplied for this build

- Shape: vertical cylinder
- Internal water height: 200 cm
- Nominal capacity: 2,000 L
- Derived cross-sectional area: about 1.0 m²
- Derived internal diameter: about 112.8 cm
- Approximate volume change: 10 L per 1 cm of water height

These derived dimensions are valid only if 200 cm is the internal usable height and 2,000 L is the tank's actual capacity. Confirm the inside dimensions and capacity.

## Mounting and calibration

The common JSN-SR04T probe has a near blind zone around 20–25 cm. Do not mount it flush against the tank roof if the water can rise closer than this.

For this 200 cm tank, use a rigid bracket that places the probe face about 30 cm above the tank's maximum water surface, vertically downward and away from the tank wall, inlet stream, braces and internal obstructions. With that mounting geometry:

- Empty tank reference: about 230 cm from probe face to bottom.
- Maximum-fill reference: about 30 cm from probe face to water surface.
- The firmware maps 230 cm to 0% and 30 cm to 100%.

**Measure both distances on the actual tank.** Replace EMPTY_DISTANCE_CM and FULL_DISTANCE_CM with the measured values. Do not use these nominal references if the bracket position or internal tank height differs. Check several known water levels and compare the calculated liters with a trusted volume reference.

The firmware takes five pings and uses their median to reduce occasional false echoes. It transmits every 10 seconds.

## Wiring

- JSN-SR04T VCC -> regulated 5V supply (check the exact sensor board revision).
- JSN-SR04T GND -> ESP32 GND (common ground).
- TRIG -> ESP32 GPIO 5.
- ECHO -> ESP32 GPIO 18 **through a voltage divider**: ECHO to GPIO node through 1 kΩ; GPIO node to GND through 2 kΩ. This reduces a 5V echo to about 3.3V. A suitable logic-level shifter is also acceptable.
- Keep the controller board and connections in a weatherproof enclosure; only the sealed probe belongs above/inside the tank area.
- Use a stable regulated supply and protect all connections from moisture.

Never connect a 5V ECHO signal directly to an ESP32 GPIO.

## Provision the device

1. Sign in at https://xray-tank-emicode.vercel.app/auth.
2. Create a tank with capacity **2000 L** in the dashboard.
3. Copy the generated tank ID and one-time device key. The key is shown once.
4. Set WIFI_SSID, WIFI_PASSWORD, API_URL, DEVICE_ID and DEVICE_KEY in the sketch.
5. Add the trusted root CA certificate for the HTTPS host. Keep TLS verification enabled.
6. Flash the ESP32 and open Serial Monitor at 115200 baud. Successful uploads should return HTTP status 201.
7. In the website, select that tank and switch to Sensor reading / قراءة الحساس. The dashboard and 3D water level then follow the latest ESP32 reading.

The device key is a secret. Never commit real Wi-Fi credentials or device keys to GitHub.

## Important limitations and safety

- This is a monitoring prototype. Do not use it as the only protection for a pump, dry-run condition or overflow. Use an independent, certified high-level cutoff and electrical protection.
- Turbulence, foam, condensation, sloped surfaces, narrow openings and nearby obstructions can distort ultrasonic readings.
- Verify the sensor's actual minimum range and output voltage for the exact JSN-SR04T revision you buy.
