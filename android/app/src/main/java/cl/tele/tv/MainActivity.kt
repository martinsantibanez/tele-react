package cl.tele.tv

import android.annotation.SuppressLint
import android.app.Activity
import android.media.MediaCodecInfo
import android.media.MediaCodecList
import android.media.MediaFormat
import android.os.Build
import android.os.Bundle
import android.os.SystemClock
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout

/**
 * A full-screen WebView around the web app. The remote's D-pad and OK reach the
 * page as ordinary ArrowUp/Down/Left/Right and Enter key events; Back, which
 * the page never sees, is handed to it as Escape.
 */
class MainActivity : Activity() {

    private lateinit var root: FrameLayout
    private lateinit var webView: WebView

    /** The element a video asked to go fullscreen with, while it is. */
    private var customView: View? = null
    private var customViewCallback: WebChromeClient.CustomViewCallback? = null

    private var lastBackAt = 0L

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)

        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            // Saved screens, favourites and tokens all live in localStorage.
            settings.domStorageEnabled = true
            // Every tile autoplays; nobody is going to press play on six of them.
            settings.mediaPlaybackRequiresUserGesture = false
            settings.userAgentString =
                "${settings.userAgentString} $USER_AGENT_MARK${decodersMark()}"
            webViewClient = WebViewClient()
            webChromeClient = ChromeClient()
            isFocusable = true
            isFocusableInTouchMode = true
        }

        root = FrameLayout(this).apply {
            setBackgroundColor(0xFF000000.toInt())
            addView(webView, matchParent())
        }
        setContentView(root)

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState)
        } else {
            webView.loadUrl(intent.getStringExtra(EXTRA_URL) ?: BuildConfig.TELE_URL)
        }
        webView.requestFocus()
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (event.keyCode != KeyEvent.KEYCODE_BACK) return super.dispatchKeyEvent(event)
        // Act once, on release, so a held Back does not fire repeatedly.
        if (event.action == KeyEvent.ACTION_UP) onBack()
        return true
    }

    private fun onBack() {
        if (customView != null) {
            customViewCallback?.onCustomViewHidden()
            hideCustomView()
            return
        }
        // Give the page an Escape first; only a second Back in quick succession
        // leaves the app.
        val now = SystemClock.uptimeMillis()
        if (now - lastBackAt < DOUBLE_BACK_MS) {
            finish()
            return
        }
        lastBackAt = now
        webView.evaluateJavascript(ESCAPE_JS, null)
    }

    private fun hideCustomView() {
        customView?.let { root.removeView(it) }
        customView = null
        customViewCallback = null
        webView.visibility = View.VISIBLE
        webView.requestFocus()
    }

    private inner class ChromeClient : WebChromeClient() {
        override fun onShowCustomView(view: View, callback: CustomViewCallback) {
            if (customView != null) {
                callback.onCustomViewHidden()
                return
            }
            customView = view
            customViewCallback = callback
            root.addView(view, matchParent())
            webView.visibility = View.GONE
            view.requestFocus()
        }

        override fun onHideCustomView() = hideCustomView()

        // Widevine, for the Spotify Web Playback SDK.
        override fun onPermissionRequest(request: PermissionRequest) {
            val granted = request.resources.filter {
                it == PermissionRequest.RESOURCE_PROTECTED_MEDIA_ID
            }
            if (granted.isEmpty()) request.deny() else request.grant(granted.toTypedArray())
        }
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onPause() {
        webView.onPause()
        super.onPause()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onDestroy() {
        root.removeAllViews()
        webView.destroy()
        super.onDestroy()
    }

    /**
     * How many H.264 streams the TV says its hardware can decode at once, as
     * ` (decoders=N)`. Only a ceiling: some TVs claim far more than they keep
     * up with, and the page learns the real number by watching playback. A
     * software decoder does not count; the WebView never falls back to one.
     */
    private fun decodersMark(): String {
        val instances = try {
            MediaCodecList(MediaCodecList.REGULAR_CODECS).codecInfos
                .filter { !it.isEncoder && isHardware(it) }
                .filter { info -> info.supportedTypes.any { it.equals(MediaFormat.MIMETYPE_VIDEO_AVC, true) } }
                .maxOfOrNull {
                    it.getCapabilitiesForType(MediaFormat.MIMETYPE_VIDEO_AVC).maxSupportedInstances
                }
        } catch (e: RuntimeException) {
            null
        }
        return if (instances == null || instances <= 0) "" else " (decoders=$instances)"
    }

    private fun isHardware(info: MediaCodecInfo): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            return info.isHardwareAccelerated && !info.isAlias
        }
        val name = info.name.lowercase()
        return !name.startsWith("omx.google.") && !name.startsWith("c2.android.") &&
            !name.endsWith(".secure")
    }

    private companion object {
        /** Lets the page know it is on the TV: `navigator.userAgent.includes('TeleTV')`. */
        const val USER_AGENT_MARK = "TeleTV/${BuildConfig.VERSION_NAME}"

        /** `adb shell am start -n cl.tele.tv/.MainActivity --es url https://...` */
        const val EXTRA_URL = "url"

        const val DOUBLE_BACK_MS = 1500L

        fun matchParent() = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        )

        const val ESCAPE_JS = """
            (function () {
              var target = document.activeElement || document.body;
              ['keydown', 'keyup'].forEach(function (type) {
                target.dispatchEvent(new KeyboardEvent(type, {
                  key: 'Escape', code: 'Escape', keyCode: 27, which: 27,
                  bubbles: true, cancelable: true
                }));
              });
            })();
        """
    }
}
