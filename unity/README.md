# Unity AR companion scaffold

The native AR client is a companion to the web dashboard. It requires Unity 6, AR Foundation, ARCore XR Plugin (Android), and ARKit XR Plugin (iOS). The scripts in this folder provide plane-based placement of a tank prefab and a level update hook.

This folder is a source scaffold, not a compiled mobile application. To finish the mobile build:
1. Create/open a Unity 6 project and install the packages above using Package Manager.
2. Add these scripts under `Assets/XRayTank/Scripts`.
3. Create/import a realistic tank prefab with a water child mesh, add a collider, and assign the water transform in `TankWaterLevel`.
4. Add an AR Session and XR Origin (AR) with AR Plane Manager and AR Raycast Manager.
5. Assign the tank prefab to `TankPlacementController`.
6. Configure Android/iOS camera permissions, XR plug-in providers, signing, and test on physical devices.

AR plane placement positions the virtual tank in the room; it does not identify water inside an opaque physical tank. Connect a calibrated sensor API before showing real measurements.
