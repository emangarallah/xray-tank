using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

namespace XRayTank
{
    /// <summary>Tap a detected horizontal plane to place or reposition the tank; pinch and twist to adjust it.</summary>
    [RequireComponent(typeof(ARRaycastManager))]
    public sealed class TankPlacementController : MonoBehaviour
    {
        [SerializeField] private GameObject tankPrefab;
        [SerializeField] private Camera arCamera;
        [SerializeField] private bool allowReposition = true;
        [SerializeField, Range(0.1f, 3f)] private float minScale = 0.35f;
        [SerializeField, Range(0.2f, 5f)] private float maxScale = 2.5f;
        [SerializeField] private float rotationSpeed = 0.2f;

        private ARRaycastManager raycastManager;
        private GameObject placedTank;
        private static readonly List<ARRaycastHit> Hits = new();
        private float initialPinchDistance;
        private Vector3 initialPinchScale;
        private float initialTwistAngle;
        private float initialYaw;

        public bool IsPlaced => placedTank != null;
        public GameObject PlacedTank => placedTank;

        private void Awake()
        {
            raycastManager = GetComponent<ARRaycastManager>();
            if (arCamera == null) arCamera = Camera.main;
        }

        private void Update()
        {
            HandlePlacement();
            HandleTwoFingerTransform();
        }

        private void HandlePlacement()
        {
            if (tankPrefab == null || Input.touchCount != 1) return;
            Touch touch = Input.GetTouch(0);
            if (touch.phase != TouchPhase.Began) return;
            if (placedTank != null && !allowReposition) return;

            if (raycastManager.Raycast(touch.position, Hits, TrackableType.PlaneWithinPolygon))
            {
                Pose pose = Hits[0].pose;
                if (placedTank == null) placedTank = Instantiate(tankPrefab, pose.position, pose.rotation);
                else placedTank.transform.SetPositionAndRotation(pose.position, pose.rotation);
            }
        }

        private void HandleTwoFingerTransform()
        {
            if (placedTank == null || Input.touchCount != 2) return;

            Touch a = Input.GetTouch(0);
            Touch b = Input.GetTouch(1);
            Vector2 delta = b.position - a.position;
            float distance = delta.magnitude;
            float angle = Mathf.Atan2(delta.y, delta.x) * Mathf.Rad2Deg;

            if (a.phase == TouchPhase.Began || b.phase == TouchPhase.Began)
            {
                initialPinchDistance = Mathf.Max(distance, 1f);
                initialPinchScale = placedTank.transform.localScale;
                initialTwistAngle = angle;
                initialYaw = placedTank.transform.eulerAngles.y;
                return;
            }

            float scaleFactor = distance / Mathf.Max(initialPinchDistance, 1f);
            float scale = Mathf.Clamp(initialPinchScale.x * scaleFactor, minScale, maxScale);
            placedTank.transform.localScale = Vector3.one * scale;

            float twist = Mathf.DeltaAngle(initialTwistAngle, angle);
            Vector3 euler = placedTank.transform.eulerAngles;
            euler.y = initialYaw + twist * rotationSpeed;
            placedTank.transform.eulerAngles = euler;
        }

        public void RemoveTank()
        {
            if (placedTank != null) Destroy(placedTank);
            placedTank = null;
        }
    }
}
