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
            if (!AssetDatabase.IsValidFolder(Root)) AssetDatabase.CreateFolder("Assets", "XRayTank");
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
            planeManager.requestedDetectionMode = UnityEngine.XR.ARSubsystems.PlaneDetectionMode.Horizontal;
            originObject.AddComponent<ARRaycastManager>();
            originObject.AddComponent<ARPlaneGuide>();

            TankPlacementController placer = originObject.AddComponent<TankPlacementController>();
            SetPrivateField(placer, "tankPrefab", tankPrefab);
            SetPrivateField(placer, "arCamera", camera);

            GameObject scanningHint = CreateHintCanvas();
            Text telemetryStatus = CreateStatusText();
            TankTelemetryClient telemetry = originObject.AddComponent<TankTelemetryClient>();
            SetPrivateField(telemetry, "placement", placer);
            SetPrivateField(telemetry, "statusLabel", telemetryStatus);
            GameObject canvasObject = GameObject.Find("AR Instructions");
            CreateTelemetryPanel(canvasObject.transform, telemetry);

            GameObject gate = new GameObject("Camera Permission Gate");
            ARCameraPermissionGate permission = gate.AddComponent<ARCameraPermissionGate>();
            SetPrivateField(permission, "arSessionRoot", sessionRoot);

            ARPlaneGuide guide = originObject.GetComponent<ARPlaneGuide>();
            SetPrivateField(guide, "scanningHint", scanningHint);
            PlayerSettings.iOS.cameraUsageDescription = "X-Ray Tank uses the camera to place a virtual tank in augmented reality.";
            PlayerSettings.SetScriptingBackend(BuildTargetGroup.Android, ScriptingImplementation.IL2CPP);
            PlayerSettings.SetApiCompatibilityLevel(BuildTargetGroup.Android, ApiCompatibilityLevel.NET_Standard_2_1);

            string scenePath = Scenes + "/XRayTankAR.unity";
            EditorSceneManager.SaveScene(scene, scenePath);
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(scenePath, true) };
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

        private static Text CreateStatusText()
        {
            GameObject canvasObject = GameObject.Find("AR Instructions");
            if (canvasObject == null) return null;
            GameObject labelObject = new GameObject("Live Telemetry Status");
            labelObject.transform.SetParent(canvasObject.transform, false);
            Text label = labelObject.AddComponent<Text>();
            label.text = "Live data not configured";
            label.alignment = TextAnchor.LowerCenter;
            label.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            label.fontSize = 22;
            label.color = Color.white;
            RectTransform rect = label.rectTransform;
            rect.anchorMin = new Vector2(0.04f, 0.01f);
            rect.anchorMax = new Vector2(0.96f, 0.08f);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            return label;
        }

        private static void CreateTelemetryPanel(Transform parent, TankTelemetryClient telemetry)
        {
            InputField idInput = CreateInputField(parent, "Tank ID", "Enter tank ID", 0.25f, 0.32f, false);
            InputField keyInput = CreateInputField(parent, "Device Key", "Paste one-time device key", 0.16f, 0.23f, true);
            GameObject buttonObject = new GameObject("Connect Telemetry", typeof(RectTransform), typeof(Image), typeof(Button));
            buttonObject.transform.SetParent(parent, false);
            RectTransform buttonRect = buttonObject.GetComponent<RectTransform>();
            buttonRect.anchorMin = new Vector2(0.2f, 0.09f);
            buttonRect.anchorMax = new Vector2(0.8f, 0.15f);
            buttonRect.offsetMin = Vector2.zero;
            buttonRect.offsetMax = Vector2.zero;
            Image image = buttonObject.GetComponent<Image>();
            image.color = new Color(0.05f, 0.42f, 0.78f, 0.95f);
            Button button = buttonObject.GetComponent<Button>();
            GameObject captionObject = new GameObject("Button Label", typeof(RectTransform), typeof(Text));
            captionObject.transform.SetParent(buttonObject.transform, false);
            Text caption = captionObject.GetComponent<Text>();
            caption.text = "CONNECT TO MY TANK";
            caption.alignment = TextAnchor.MiddleCenter;
            caption.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            caption.fontSize = 22;
            caption.fontStyle = FontStyle.Bold;
            caption.color = Color.white;
            RectTransform captionRect = caption.rectTransform;
            captionRect.anchorMin = Vector2.zero;
            captionRect.anchorMax = Vector2.one;
            captionRect.offsetMin = Vector2.zero;
            captionRect.offsetMax = Vector2.zero;
            TelemetrySetupPanel panel = parent.gameObject.AddComponent<TelemetrySetupPanel>();
            SetPrivateField(panel, "tankIdInput", idInput);
            SetPrivateField(panel, "deviceKeyInput", keyInput);
            SetPrivateField(panel, "connectButton", button);
            SetPrivateField(panel, "telemetryClient", telemetry);
        }

        private static InputField CreateInputField(Transform parent, string name, string placeholder, float minY, float maxY, bool password)
        {
            GameObject fieldObject = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(InputField));
            fieldObject.transform.SetParent(parent, false);
            RectTransform rect = fieldObject.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0.06f, minY);
            rect.anchorMax = new Vector2(0.94f, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            Image background = fieldObject.GetComponent<Image>();
            background.color = new Color(1f, 1f, 1f, 0.92f);
            InputField input = fieldObject.GetComponent<InputField>();
            GameObject textObject = new GameObject("Text", typeof(RectTransform), typeof(Text));
            textObject.transform.SetParent(fieldObject.transform, false);
            Text valueText = textObject.GetComponent<Text>();
            valueText.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            valueText.fontSize = 20;
            valueText.color = Color.black;
            valueText.alignment = TextAnchor.MiddleLeft;
            RectTransform textRect = valueText.rectTransform;
            textRect.anchorMin = new Vector2(0.03f, 0f);
            textRect.anchorMax = new Vector2(0.97f, 1f);
            textRect.offsetMin = Vector2.zero;
            textRect.offsetMax = Vector2.zero;
            GameObject placeholderObject = new GameObject("Placeholder", typeof(RectTransform), typeof(Text));
            placeholderObject.transform.SetParent(fieldObject.transform, false);
            Text placeholderText = placeholderObject.GetComponent<Text>();
            placeholderText.text = placeholder;
            placeholderText.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            placeholderText.fontSize = 19;
            placeholderText.fontStyle = FontStyle.Italic;
            placeholderText.color = new Color(0.35f, 0.35f, 0.35f, 1f);
            placeholderText.alignment = TextAnchor.MiddleLeft;
            RectTransform placeholderRect = placeholderText.rectTransform;
            placeholderRect.anchorMin = new Vector2(0.03f, 0f);
            placeholderRect.anchorMax = new Vector2(0.97f, 1f);
            placeholderRect.offsetMin = Vector2.zero;
            placeholderRect.offsetMax = Vector2.zero;
            input.textComponent = valueText;
            input.placeholder = placeholderText;
            input.targetGraphic = background;
            input.contentType = password ? InputField.ContentType.Password : InputField.ContentType.Standard;
            input.lineType = InputField.LineType.SingleLine;
            return input;
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
