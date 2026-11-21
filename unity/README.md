# X-Ray Tank — Unity AR mobile companion

This is the native Android/iOS companion. It is separate from the Next.js website: the website itself does not open the mobile AR camera.

## Requirements
- Unity Editor 6000.0 (Unity 6).
- Android Build Support (SDK, NDK, OpenJDK) for Android builds.
- iOS Build Support and macOS/Xcode for iOS builds.
- An ARCore-supported Android phone or ARKit-supported iPhone for physical-device testing.
- Internet access for live telemetry.

AR Foundation, ARCore XR Plugin, and ARKit XR Plugin are pinned to 6.0.3, matching Unity 6000.0. Unity requires matching AR Foundation and platform-provider package versions. See https://docs.unity.com/en-us/engine/6000.0/manual/xr/support/support-packages and https://docs.unity.cn/6000.0/Documentation/Manual/xr-support-packages.html

## Create the AR scene
1. Clone the repository.
2. In Unity Hub, choose **Add project from disk** and select this `unity` folder.
3. Open with Unity 6 and allow Package Manager to resolve the manifest.
4. In Unity choose **X-Ray Tank → Build Starter AR Scene**.
5. Open `Assets/XRayTank/Scenes/XRayTankAR.unity` if it is not already open.
6. In **Edit → Project Settings → XR Plug-in Management**, install/enable XR Plug-in Management if prompted. Enable **ARCore** for Android and **ARKit** for iOS.
7. Select Android or iOS in Build Settings, set a unique application/bundle identifier, and build to a physical device.

The generated scene contains AR Session, XR Origin, AR Camera Manager + AR Camera Background, horizontal plane detection, raycasting, a camera permission gate, a starter transparent tank prefab, and touch placement/scale/rotation gestures. The generated scene is added to Build Settings automatically.

## Use the camera
Launch the built app and grant camera permission. The live camera image appears behind the AR scene. Move the phone slowly to scan a flat floor/table, then tap the detected surface to place the virtual tank. Tap another detected surface to reposition it; pinch and twist with two fingers to scale and rotate.

## Live telemetry
The `TankTelemetryClient` polls `https://xray-tank-emicode.vercel.app/api/telemetry?deviceId=YOUR_TANK_ID` every 15 seconds using the tank's one-time device key in the `x-device-key` header. The API checks the SHA-256 hash stored for that tank and returns only that tank's latest reading. When a reading arrives, the placed model's water mesh is updated and the UI shows the live percentage and timestamp.

To configure it, create a tank in the web dashboard and copy its device ID and one-time device key. Open the AR app, enter the tank ID and paste the device key into the on-screen fields, then tap **CONNECT TO MY TANK**. The key field is cleared after submission. If the key is lost, rotate it in the dashboard and enter the new key. Keep device keys private; a key entered into a distributed mobile app can still be extracted by a determined user, so this is a prototype credential scheme rather than a hardened consumer-device identity system.

## Important limitations and safety
- The included tank is a procedural starter model, not a finished photorealistic product asset.
- Source code has not yet been built or tested on physical Android/iOS hardware; no signed APK/IPA is included.
- The live telemetry client and API source are connected, but an actual live reading requires a registered tank and a calibrated physical sensor sending data. Until then the UI will say it is waiting or not configured.
- AR places a virtual tank in the room. A phone camera cannot see through an opaque tank or measure its water level. Real measurements require the external calibrated sensor.
- This prototype is monitoring only. Never use it as the sole pump, dry-run, or overflow protection; use independent rated safety cutoffs and electrical protection.

## Main scripts
- `Assets/XRayTank/Scripts/ARCameraPermissionGate.cs` — camera permission.
- `Assets/XRayTank/Scripts/ARPlaneGuide.cs` — surface scan guidance.
- `Assets/XRayTank/Scripts/TankPlacementController.cs` — tap placement and gestures.
- `Assets/XRayTank/Scripts/TankWaterLevel.cs` — water mesh visualization.
- `Assets/XRayTank/Scripts/TankTelemetryClient.cs` — authenticated live polling.
- `Assets/XRayTank/Scripts/TelemetrySetupPanel.cs` — on-device credential form.
- `Assets/XRayTank/Editor/XRayTankSceneBuilder.cs` — scene and prefab generator.