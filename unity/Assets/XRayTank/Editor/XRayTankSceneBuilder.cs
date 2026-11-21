#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using Unity.XR.CoreUtils;
using UnityEngine.XR.ARFoundation;

namespace XRayTank.Editor
{
    /// <summary>Creates a runnable starter AR scene and a simple tank prefab.</summary>
    public static class XRayTankSceneBuilder
    {
        private const string Root = "Assets/XRayTank";
        private const string Prefabs = Root + "/Prefabs";
        private const string Scenes = Root + "/Scenes";
        private const string Materials = Root + "/Materials";

        [MenuItem("X-Ray Tank/Build Starter AR Scene")]
        public static void Build()
        {
            EnsureFolder(Root, "Prefabs");
            EnsureFolder(Root, "Scenes");
            EnsureFolder(Root, "Materials");

            Material shell = MakeMaterial("TankGlass", new Color(0.35f, 0.75f, 0.9f, 0.28f), true);
            Material water = MakeMaterial("TankWater", new Color(0.05f, 0.48f, 0.95f, 0.82f), true);
            Material plane = MakeMaterial("DetectedPlane", new Color(0.15f, 0.8f, 0.7f, 0.18f), true);
            GameObject tankPrefab = CreateTankPrefab(shell, water);
            GameObject planePrefab = CreatePlanePrefab(plane);

            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            GameObject sessionRoot = new GameObject("AR Session Root");
            sessionRoot.AddComponent<ARSession>();

            GameObject originObject = new GameObject("XR Origin");
            originObject.transform.SetParent(sessionRoot.transform, false);
            XROrigin origin = originObject.AddComponent<XROrigin>();
            GameObject cameraObject = new GameObject("AR Camera");
            cameraObject.tag = "MainCamera";
            cameraObject.transform.SetParent(originObject.transform, false);
            Camera camera = cameraObject.AddComponent<Camera>();
            camera.clearFlags = CameraClearFlags.SolidColor;
            cameraObject.AddComponent<ARCameraManager>();
            cameraObject.AddComponent<ARCameraBackground>();
            origin.Camera = camera;

            ARPlaneManager planeManager = originObject.AddComponent<ARPlaneManager>();
            planeManager.planePrefab = planePrefab;
            originObject.AddComponent<ARRaycastManager>();
            originObject.AddComponent<ARPlaneGuide>();

            GameObject placement = new GameObject("Tank Placement Controller");
            placement.transform.SetParent(originObject.transform, false);
            TankPlacementController placer = placement.AddComponent<TankPlacementController>();
            SetPrivateField(placer, "tankPrefab", tankPrefab);
            SetPrivateField(placer, "arCamera", camera);

            GameObject gate = new GameObject("Camera Permission Gate");
            ARCameraPermissionGate permission = gate.AddComponent<ARCameraPermissionGate>();
            SetPrivateField(permission, "arSessionRoot", sessionRoot);

            GameObject scanningHint = CreateHintCanvas();
            ARPlaneGuide guide = originObject.GetComponent<ARPlaneGuide>();
            SetPrivateField(guide, "scanningHint", scanningHint);
            PlayerSettings.iOS.cameraUsageDescription = "X-Ray Tank uses the camera to place a virtual tank in augmented reality.";

            EditorSceneManager.SaveScene(scene, Scenes + "/XRayTankAR.unity");
            AssetDatabase.SaveAssets();
            Selection.activeObject = tankPrefab;
            EditorUtility.DisplayDialog("X-Ray Tank", "AR scene and starter tank prefab created. Open Scenes/XRayTankAR and configure XR Plug-in Management for Android/iOS.", "OK");
        }

        private static GameObject CreateTankPrefab(Material shell, Material water)
        {
            GameObject root = new GameObject("XRayTank_RealisticStarter");
            GameObject body = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            body.name = "TransparentTankBody";
            body.transform.SetParent(root.transform, false);
            body.transform.localScale = new Vector3(0.62f, 0.9f, 0.62f);
            body.GetComponent<Renderer>().sharedMaterial = shell;

            GameObject liquid = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            liquid.name = "WaterLevel";
            liquid.transform.SetParent(root.transform, false);
            liquid.transform.localScale = new Vector3(0.55f, 0.9f, 0.55f);
            liquid.transform.localPosition = new Vector3(0f, -0.45f, 0f);
            liquid.GetComponent<Renderer>().sharedMaterial = water;
            Object.DestroyImmediate(liquid.GetComponent<Collider>());

            TankWaterLevel level = root.AddComponent<TankWaterLevel>();
            SetPrivateField(level, "waterMesh", liquid.transform);
            GameObject prefab = PrefabUtility.SaveAsPrefabAsset(root, Prefabs + "/XRayTank_Starter.prefab");
            Object.DestroyImmediate(root);
            return prefab;
        }

        private static GameObject CreatePlanePrefab(Material material)
        {
            GameObject plane = new GameObject("AR Plane Visual");
            plane.AddComponent<MeshFilter>();
            MeshRenderer renderer = plane.AddComponent<MeshRenderer>();
            renderer.sharedMaterial = material;
            plane.AddComponent<ARPlane>();
            plane.AddComponent<ARPlaneMeshVisualizer>();
            GameObject prefab = PrefabUtility.SaveAsPrefabAsset(plane, Prefabs + "/ARPlaneVisual.prefab");
            Object.DestroyImmediate(plane);
            return prefab;
        }

        private static GameObject CreateHintCanvas()
        {
            GameObject canvasObject = new GameObject("AR Instructions");
            Canvas canvas = canvasObject.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasObject.AddComponent<CanvasScaler>();
            canvasObject.AddComponent<GraphicRaycaster>();

            GameObject textObject = new GameObject("Scanning Hint");
            textObject.transform.SetParent(canvasObject.transform, false);
            Text text = textObject.AddComponent<Text>();
            text.text = "Move your phone slowly to scan a flat surface";
            text.alignment = TextAnchor.UpperCenter;
            text.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            text.fontSize = 28;
            text.color = Color.white;
            RectTransform rect = text.rectTransform;
            rect.anchorMin = new Vector2(0.05f, 0.82f);
            rect.anchorMax = new Vector2(0.95f, 0.96f);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            return textObject;
        }

        private static Material MakeMaterial(string name, Color color, bool transparent)
        {
            string path = Materials + "/" + name + ".mat";
            Material existing = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (existing != null)
            {
                existing.color = color;
                EditorUtility.SetDirty(existing);
                return existing;
            }
            Shader shader = Shader.Find("Standard");
            Material material = new Material(shader) { name = name, color = color };
            if (transparent)
            {
                material.SetFloat("_Mode", 3f);
                material.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
                material.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
                material.SetInt("_ZWrite", 0);
                material.DisableKeyword("_ALPHATEST_ON");
                material.EnableKeyword("_ALPHABLEND_ON");
                material.DisableKeyword("_ALPHAPREMULTIPLY_ON");
                material.renderQueue = 3000;
            }
            AssetDatabase.CreateAsset(material, path);
            return material;
        }

        private static void EnsureFolder(string parent, string child)
        {
            string path = parent + "/" + child;
            if (!AssetDatabase.IsValidFolder(path)) AssetDatabase.CreateFolder(parent, child);
        }

        private static void SetPrivateField<T>(T target, string fieldName, object value)
        {
            var field = typeof(T).GetField(fieldName, System.Reflection.BindingFlags.Instance |
                System.Reflection.BindingFlags.NonPublic);
            if (field != null) field.SetValue(target, value);
        }
    }
}
#endif
