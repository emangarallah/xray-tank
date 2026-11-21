using System;
using System.Collections;
using System.Globalization;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

namespace XRayTank
{
    /// <summary>Polls the per-tank telemetry endpoint and updates the placed AR water mesh.</summary>
    public sealed class TankTelemetryClient : MonoBehaviour
    {
        [SerializeField] private string apiBaseUrl = "https://xray-tank-emicode.vercel.app";
        [SerializeField] private string deviceId = "";
        [SerializeField] private string deviceKey = "";
        [SerializeField, Min(5f)] private float pollSeconds = 15f;
        [SerializeField] private TankPlacementController placement;
        [SerializeField] private Text statusLabel;
        [SerializeField] private Text levelLabel;

        private Coroutine polling;
        private bool configured;

        [Serializable] private class ApiResponse { public Reading reading; public Tank tank; }
        [Serializable] private class Reading { public float level_percent; public float distance_cm; public float temperature_c; public string recorded_at; }
        [Serializable] private class Tank { public string id; public string name; public float capacity_liters; }

        private void OnEnable()
        {
            configured = !string.IsNullOrWhiteSpace(deviceId) && !string.IsNullOrWhiteSpace(deviceKey);
            SetStatus(configured ? "Connecting to live tank data…" : "Live data not configured — add tank ID and device key in Inspector.");
            if (configured) polling = StartCoroutine(PollLoop());
        }

        private void OnDisable()
        {
            if (polling != null) StopCoroutine(polling);
            polling = null;
        }

        private IEnumerator PollLoop()
        {
            while (true)
            {
                yield return FetchLatest();
                yield return new WaitForSecondsRealtime(Mathf.Max(5f, pollSeconds));
            }
        }

        private IEnumerator FetchLatest()
        {
            string url = apiBaseUrl.TrimEnd('/') + "/api/telemetry?deviceId=" + UnityWebRequest.EscapeURL(deviceId);
            using (UnityWebRequest request = UnityWebRequest.Get(url))
            {
                request.timeout = 12;
                request.SetRequestHeader("x-device-key", deviceKey);
                request.SetRequestHeader("Accept", "application/json");
                yield return request.SendWebRequest();

                if (request.result != UnityWebRequest.Result.Success)
                {
                    SetStatus("Live connection unavailable: " + request.responseCode + ". Retrying…");
                    yield break;
                }

                ApiResponse payload;
                try { payload = JsonUtility.FromJson<ApiResponse>(request.downloadHandler.text); }
                catch { SetStatus("Invalid response from telemetry service. Retrying…"); yield break; }
                if (payload == null || payload.reading == null)
                {
                    SetStatus("Connected — waiting for the first sensor reading.");
                    yield break;
                }

                float level = Mathf.Clamp(payload.reading.level_percent, 0f, 100f);
                if (placement != null && placement.PlacedTank != null)
                {
                    TankWaterLevel water = placement.PlacedTank.GetComponentInChildren<TankWaterLevel>();
                    if (water != null) water.SetLevelPercent(level);
                }
                bool stale = !DateTimeOffset.TryParse(payload.reading.recorded_at, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out DateTimeOffset recordedAt) || (DateTimeOffset.UtcNow - recordedAt.ToUniversalTime()).TotalMinutes > 5;
                SetStatus((stale ? "STALE • " : "LIVE • ") + "Water: " + level.ToString("0.0") + "% • " + payload.reading.recorded_at + (payload.reading.temperature_c != 0f ? " • " + payload.reading.temperature_c.ToString("0.0") + " °C" : ""));
            }
        }

        private void SetStatus(string message)
        {
            if (statusLabel != null) statusLabel.text = message;
        }
    }
}