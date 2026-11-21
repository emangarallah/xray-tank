# X-Ray Tank

Wireless smart water-tank monitoring with a live 3D dashboard.

## What's included
- Next.js + TypeScript dashboard with Arabic/English interface.
- Interactive Three.js tank model and clearly separated Demo / Live modes.
- Neon PostgreSQL telemetry API for ESP32 over HTTPS.
- Unity 6 mobile AR companion source with camera permission, ARCore/ARKit providers, plane detection, tank placement, and touch gestures.
- SQL schema, environment template, and deployment notes.

**Not included yet:** a compiled/signed Unity APK or IPA, or physical sensor hardware. The Unity AR source is in `unity/`; it must be opened, generated, built, and tested with Unity on physical devices. The web dashboard remains a separate web experience.

## Run locally
1. Node.js 20+
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in values.
4. Run `db/schema.sql` in Neon SQL Editor.
5. `npm run dev`

## Device API
POST `/api/telemetry` with header `x-device-key: DEVICE_API_KEY`:
```json
{"deviceId":"tank-001","levelPercent":64.5,"distanceCm":72.4,"temperatureC":24.1}
```

GET `/api/telemetry?deviceId=tank-001` returns the latest stored reading.

## Safety
Demo data is simulated, never a real sensor reading. An opaque closed tank cannot be measured by the phone camera. Do not use this prototype for pump control or overflow protection; install independent rated safety switches. Calibrate the sensor for the tank geometry before relying on readings.
