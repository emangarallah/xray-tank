using UnityEngine;

namespace XRayTank
{
    /// <summary>Resizes a water mesh from its configured full-height scale.</summary>
    public sealed class TankWaterLevel : MonoBehaviour
    {
        [SerializeField] private Transform waterMesh;
        [SerializeField, Range(0f, 1f)] private float level = 0.5f;
        [SerializeField] private float tankHeight = 1.8f;
        [SerializeField] private float tankBottomY = -0.9f;

        private Vector3 fullWaterScale;

        private void Awake()
        {
            if (waterMesh != null) fullWaterScale = waterMesh.localScale;
            ApplyLevel();
        }

        public void SetLevelPercent(float percent)
        {
            level = Mathf.Clamp01(percent / 100f);
            ApplyLevel();
        }

        private void ApplyLevel()
        {
            if (waterMesh == null) return;
            Vector3 scale = fullWaterScale;
            scale.y = Mathf.Max(0.001f, fullWaterScale.y * level);
            waterMesh.localScale = scale;

            Vector3 position = waterMesh.localPosition;
            position.y = tankBottomY + (tankHeight * level * 0.5f);
            waterMesh.localPosition = position;
        }
    }
}
