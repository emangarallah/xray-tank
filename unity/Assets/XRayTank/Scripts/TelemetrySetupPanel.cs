using UnityEngine;
using UnityEngine.UI;

namespace XRayTank
{
    /// <summary>Lets users enter their tank ID and one-time device key on the phone.</summary>
    public sealed class TelemetrySetupPanel : MonoBehaviour
    {
        [SerializeField] private InputField tankIdInput;
        [SerializeField] private InputField deviceKeyInput;
        [SerializeField] private Button connectButton;
        [SerializeField] private TankTelemetryClient telemetryClient;

        private void OnEnable()
        {
            if (connectButton != null) connectButton.onClick.AddListener(Connect);
        }

        private void OnDisable()
        {
            if (connectButton != null) connectButton.onClick.RemoveListener(Connect);
        }

        private void Connect()
        {
            if (telemetryClient == null) return;
            string id = tankIdInput != null ? tankIdInput.text : string.Empty;
            string key = deviceKeyInput != null ? deviceKeyInput.text : string.Empty;
            telemetryClient.ConnectWithCredentials(id, key);
            if (!string.IsNullOrWhiteSpace(id) && key.Length >= 32 && key.Length <= 128)
            {
                if (deviceKeyInput != null) deviceKeyInput.text = string.Empty;
            }
        }
    }
}