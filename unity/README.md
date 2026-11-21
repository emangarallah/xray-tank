# X-Ray Tank — Native AR companion

This folder is the Unity mobile AR project root. It adds a live camera-backed AR scene for Android and iOS. It is separate from the Next.js website: opening the website does not automatically open the phone camera.

## Requirements
- Unity Editor 6000.0 (Unity 6).
- Android Build Support with Android SDK/NDK and OpenJDK for Android builds.
- iOS Build Support + macOS/Xcode for iOS builds.
- A physical ARCore-supported Android phone or ARKit-supported iPhone for real camera/plane-tracking tests.
- Camera permission granted by the user.

The package manifest pins AR Foundation, ARCore XR Plugin, and ARKit XR Plugin to 6.0.3. Unity's platform provider plug-ins must be enabled for the matching build target. Official setup guide: https://developers.google.com/ar/develop/unity-arf/getting-started-ar-foundation

## Open and generate the scene
1. Clone this repository.
2. In Unity Hub, choose **Add project from disk** and select the `unity` folder (not the repository root).
3. Open with Unity 6. Let Package Manager resolve Packages/manifest.json.
4. In Unity, choose **X-Ray Tank → Build Starter AR Scene**.
5. Open Assets/XRayTank/Scenes/XRayTankAR.unity.
6. In **Edit → Project Settings → XR Plug-in Management**, install/enable the provider if prompted. Enable **ARCore** on Android and **ARKit** on iOS.
7. Switch Build Settings to Android or iOS, set the package/bundle identifier, and build to a physical device.

The scene builder creates an AR Session and XR Origin with AR Camera Manager + AR Camera Background (live camera feed), plane detection, AR raycasting, a camera permission gate, a starter tank prefab, and tap/pinch/rotation gestures.

## Using the camera
Launch the built app on the phone and accept camera permission. The camera view is the full-screen background. Move the phone slowly until a horizontal plane is detected, then tap the floor/table to place the virtual tank. Tap another detected plane to reposition it. Use two fingers to resize and rotate the model.

If permission is denied, enable Camera access for X-Ray Tank in the phone's system settings and reopen the app.

## Current limitations
- The generated tank is a starter 3D model, not a finished photorealistic manufactured tank asset.
- AR placement and camera rendering are implemented in source, but this repository has not yet been built or tested on a physical Android/iOS device. A signed APK/IPA is not included.
- The web dashboard's live readings are not yet authenticated and wired into this Unity AR scene. Do not present demo values as sensor measurements.
- AR only places a virtual tank in the room. It does not see through an opaque real tank or measure water by camera. Real measurements still require a calibrated external sensor sending telemetry to the backend.
- This is monitoring only, not a safety controller. Use an independent rated overflow cutoff and electrical protection.

## Source scripts
- Assets/XRayTank/Scripts/ARCameraPermissionGate.cs
- Assets/XRayTank/Scripts/ARPlaneGuide.cs
- Assets/XRayTank/Scripts/TankPlacementController.cs
- Assets/XRayTank/Scripts/TankWaterLevel.cs
- Assets/XRayTank/Editor/XRayTankSceneBuilder.cs
