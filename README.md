# X-Ray Tank

Wireless smart water-tank monitoring with a browser-based 3D dashboard and camera overlay.

## What's included
- Next.js + TypeScript dashboard with Arabic/English interface.
- Interactive Three.js tank model with separate Demo / Live telemetry modes.
- Browser camera preview using getUserMedia over HTTPS, with a draggable and resizable 3D tank overlay.
- Neon PostgreSQL telemetry API for ESP32 over HTTPS.
- ESP32 firmware example, SQL schema, environment template, and deployment notes.

## Camera experience
Open the dashboard on a phone, choose **Open camera AR**, and allow camera access. Drag the 3D tank overlay and adjust its size. This browser mode is a camera compositing preview; it does not claim automatic plane detection, world tracking, or persistent AR anchors. Browser camera access requires HTTPS and permission. If camera access is unavailable, the normal 3D dashboard remains usable.

## Run locally
1. Node.js 20+
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in values.
4. Run `db/schema.sql` in Neon SQL Editor.
5. Run `npm run dev`.

## Device API
POST `/api/telemetry` with header `x-device-key: DEVICE_KEY`:
```json
{"deviceId":"your-tank-id","levelPercent":64.5,"distanceCm":72.4,"temperatureC":24.1}
```
GET `/api/telemetry?deviceId=your-tank-id` returns the latest stored reading. A per-tank device key is used for device authentication.

## Safety
Demo data is simulated, never a real sensor reading. An opaque closed tank cannot be measured by the phone camera. Real measurements require a calibrated sensor such as the supported ESP32 ultrasonic setup. Do not use this prototype for pump control or overflow prevention; install independent rated safety switches.
