using System.Collections;
using UnityEngine;
#if UNITY_ANDROID
using UnityEngine.Android;
#endif

namespace XRayTank
{
    /// <summary>Requests camera access before starting the AR session.</summary>
    public sealed class ARCameraPermissionGate : MonoBehaviour
    {
        [SerializeField] private GameObject arSessionRoot;
        [SerializeField] private GameObject permissionMessage;

        private IEnumerator Start()
        {
            if (arSessionRoot != null) arSessionRoot.SetActive(false);
            if (permissionMessage != null) permissionMessage.SetActive(true);

#if UNITY_ANDROID
            if (!Permission.HasUserAuthorizedPermission(Permission.Camera))
            {
                Permission.RequestUserPermission(Permission.Camera);
                float wait = 0f;
                while (!Permission.HasUserAuthorizedPermission(Permission.Camera) && wait < 20f)
                {
                    wait += Time.unscaledDeltaTime;
                    yield return null;
                }
            }
            bool granted = Permission.HasUserAuthorizedPermission(Permission.Camera);
#elif UNITY_IOS
            yield return Application.RequestUserAuthorization(UserAuthorization.WebCam);
            bool granted = Application.HasUserAuthorization(UserAuthorization.WebCam);
#else
            bool granted = Application.HasUserAuthorization(UserAuthorization.WebCam);
            if (!granted)
            {
                yield return Application.RequestUserAuthorization(UserAuthorization.WebCam);
                granted = Application.HasUserAuthorization(UserAuthorization.WebCam);
            }
#endif

            if (permissionMessage != null) permissionMessage.SetActive(!granted);
            if (arSessionRoot != null) arSessionRoot.SetActive(granted);
        }
    }
}
