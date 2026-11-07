# ANDROID TV (T95 BOX) PERFORMANCE & RUNTIME DIAGNOSTICS MANUAL
**Target Package:** `com.funtarget.app`  
**Target Hardware:** T95 Android TV Box (Allwinner H6/H616, Mali-450 / Mali-G31 GPU, 1GB–2GB RAM)  
**Target Architecture:** Android WebView (Chromium) wrapped by Capacitor  
**Date:** November 7, 2026  

---

## 1. ADB Connection & Remote Shell Setup

Connect your development machine to the T95 Android TV Box over the local network:

```powershell
# Set path to Android SDK platform-tools
$ADB = "C:\Users\USER\AppData\Local\Android\Sdk\platform-tools\adb.exe"

# Connect via Wireless ADB (Default port: 5555)
& $ADB connect 192.168.1.64:5555

# Verify device authorization and status
& $ADB devices -l
```

---

## 2. Memory Diagnostics (Verifying Memory Leaks & OOM)

### A. Real-Time Process Heap & GraphicBuffer Breakdown
This command prints the exact breakdown of Native Heap, Dalvik Heap, and critically: **EGL mtrack / GL mtrack (GPU VRAM)** and **Views / GraphicBuffers**.

```powershell
& $ADB -s 192.168.1.64:5555 shell dumpsys meminfo com.funtarget.app
```

#### What to Look For:
- **`EGL mtrack` / `GL mtrack`:** If this exceeds **128 MB – 180 MB**, the Mali GPU is out of texture memory.
- **`GraphicBuffer`:** Shows the number and byte size of allocated surface buffers.
- **`Native Heap`:** Memory consumed by Chromium's C++ Blink rendering engine and decoded WebP bitmaps.
- **Comparison Test:**
  1. Run `dumpsys meminfo` at minute 1 (Initial login `demo2`).
  2. Run `dumpsys meminfo` after 15 minutes of gameplay.
  3. Run `dumpsys meminfo` immediately after switching account to `demo1`.
  *If `EGL mtrack` or `Native Heap` doubles after account switch, it confirms the un-freed texture accumulation.*

### B. Continuous Top Process & Memory Monitoring
Monitor whether the kernel swap daemon (`kswapd0`) is saturating the CPU during the 1–2 minute freeze:

```powershell
# Check CPU usage and memory consumption in real time (refresh every 2 seconds)
& $ADB -s 192.168.1.64:5555 shell top -m 8 -d 2
```

#### Key Indicator:
If `kswapd0` or `system_server` spikes to **90%–100% CPU** when the freeze occurs, this confirms **Kernel Out-Of-Memory Paging Thrashing**.

### C. Low Memory Killer (LMK) & Process Kill Logs
Listen to Android OS kernel event logs to see when background services or app components are killed due to low RAM:

```powershell
& $ADB -s 192.168.1.64:5555 shell logcat -b events | Select-String "am_kill|lowmem|am_drop"
```

---

## 3. GPU Rendering & Frame Jank Diagnostics

### A. Profile GPU Rendering & Dropped Frames
Measure rendering performance and dropped VSYNC frames:

```powershell
# Reset graphics statistics
& $ADB -s 192.168.1.64:5555 shell dumpsys gfxinfo com.funtarget.app reset

# ... Let the game run or switch accounts ...

# Output framerate statistics and jank analysis
& $ADB -s 192.168.1.64:5555 shell dumpsys gfxinfo com.funtarget.app
```

#### What to Look For:
- **`Janky frames:`** Number of frames taking > 16.6ms (60 FPS threshold).
- **`Number Missed Vsync:`** Indicates when GPU texture swapping stalled the Chromium compositor.
- **`Number Frame Deadline Missed:`** Directly explains wheel stuttering during the spin phase.

### B. Live OpenGL & Chromium Errors Logcat Filter
Detect when `GL_OUT_OF_MEMORY` causes images to render as solid black:

```powershell
& $ADB -s 192.168.1.64:5555 shell "logcat -d | grep -iE 'chromium|OpenGL|egl|texture|out of memory|GL_'"
```

#### Expected Signatures:
- `E/chromium: [ERROR:raster_buffer_provider.cc] Failed to allocate raster buffer`
- `E/libEGL: eglCreateImageKHR: out of memory`
- `W/Adreno-GSL / W/Mali: <wait_for_gpu_fence>: GPU timeout`

---

## 4. Live Chrome DevTools Remote Inspection

`MainActivity.java` has remote debugging enabled:
```java
// MainActivity.java:160
WebView.setWebContentsDebuggingEnabled(true);
```

### Steps to Inspect Live on PC:
1. Ensure your PC is connected to the TV box via ADB:
   `adb connect 192.168.1.64:5555`
2. Open Google Chrome on your desktop computer.
3. In the Chrome address bar, navigate to:
   `chrome://inspect/#devices`
4. Under "Remote Target", locate `FunGame (com.funtarget.app)`.
5. Click **"inspect"**.

### Inside Chrome DevTools:
1. **Memory Tab &rarr; Heap Snapshot:**
   - Take Heap Snapshot 1 during `demo2`.
   - Perform account switch to `demo1`.
   - Take Heap Snapshot 2.
   - Filter by "Objects allocated between Snapshot 1 and 2" &rarr; Inspect `HTMLImageElement` and detached DOM trees.
2. **Performance Tab:**
   - Record 30 seconds of gameplay.
   - Notice the persistent GPU memory line and CPU task frequency.
3. **Rendering Drawer &rarr; Layer Borders:**
   - Enable "Layer borders" to visually see how many independent GPU backing textures are active simultaneously on screen.

---

## 5. Clean Reset / Cache Clear Command

To reset the application to a 100% clean state during test runs:

```powershell
# Terminate and wipe all cached textures, IndexedDB, and localStorage
& $ADB -s 192.168.1.64:5555 shell pm clear com.funtarget.app

# Relaunch the application fresh
& $ADB -s 192.168.1.64:5555 shell monkey -p com.funtarget.app -c android.intent.category.LAUNCHER 1
```

