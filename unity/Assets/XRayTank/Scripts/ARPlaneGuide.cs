using UnityEngine;
using UnityEngine.XR.ARFoundation;

namespace XRayTank
{
    /// <summary>Exposes plane-scanning state for a UI label or hint panel.</summary>
    [RequireComponent(typeof(ARPlaneManager))]
    public sealed class ARPlaneGuide : MonoBehaviour
    {
        [SerializeField] private GameObject scanningHint;
        [SerializeField] private GameObject placementHint;

        private ARPlaneManager planes;

        private void Awake() => planes = GetComponent<ARPlaneManager>();

        private void Update()
        {
            bool foundPlane = planes != null && planes.trackables.count > 0;
            if (scanningHint != null) scanningHint.SetActive(!foundPlane);
            if (placementHint != null) placementHint.SetActive(foundPlane);
        }
    }
}
