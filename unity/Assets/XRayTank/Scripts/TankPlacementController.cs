using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

namespace XRayTank
{
    /// <summary>Tap a detected horizontal plane to place the tank prefab in AR.</summary>
    [RequireComponent(typeof(ARRaycastManager))]
    public sealed class TankPlacementController : MonoBehaviour
    {
        [SerializeField] private GameObject tankPrefab;
        [SerializeField] private Camera arCamera;
        [SerializeField] private bool allowReposition = true;

        private ARRaycastManager raycastManager;
        private GameObject placedTank;
        private static readonly List<ARRaycastHit> Hits = new();

        private void Awake()
        {
            raycastManager = GetComponent<ARRaycastManager>();
            if (arCamera == null) arCamera = Camera.main;
        }

        private void Update()
        {
            if (tankPrefab == null || Input.touchCount == 0) return;
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

        public void RemoveTank()
        {
            if (placedTank != null) Destroy(placedTank);
            placedTank = null;
        }
    }
}
