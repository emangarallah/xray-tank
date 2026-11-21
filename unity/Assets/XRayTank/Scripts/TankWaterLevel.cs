using UnityEngine;

namespace XRayTank
{
    /// <summary>Updates a water mesh inside a tank prefab. Level is normalized from 0 to 1.</summary>
    public sealed class TankWaterLevel : MonoBehaviour
    {
        [SerializeField] private Transform waterMesh;
        [SerializeField, Range(0f, 1f)] private float level = 0.5f;
        [SerializeField] private float tankHeight = 1.8f;
        [SerializeField] private float tankBottomY = -0.9f;

        public void SetLevelPercent(float percent)
        {
            level = Mathf.Clamp01(percent / 100f);
            if (waterMesh == null) return;
            Vector3 scale = waterMesh.localScale;
            scale.y = Mathf.Max(0.001f, level);
            waterMesh.localScale = scale;
            Vector3 position = waterMesh.localPosition;
            position.y = tankBottomY + (tankHeight * level * 0.5f);
            waterMesh.localPosition = position;
        }
    }
}
