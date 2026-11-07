# FUN TARGET — ANDROID TV TESTING & DIAGNOSTICS REPORT
**Target Device:** T-95 Android TV Box (IP: `192.168.1.64:5555`)  
**Package Name:** `com.funtarget.app`  
**APK Location:** `Fun Target React/build_apk/FunTarget_Production_Optimized.apk`  
**Authoritative Diagnostic Framework**

---

## 1. Fast Deployment to Android TV Box

The optimized APK has been pre-assembled and placed in `build_apk/FunTarget_Production_Optimized.apk`.

### Step 1: Connect to the Android TV Box via ADB
Ensure Developer Options and USB/Network Debugging are enabled on the T-95 TV Box.
```powershell
# Connect over local network Wi-Fi / Ethernet
adb connect 192.168.1.64:5555

# Verify device is listed as 'device' (not unauthorized or offline)
adb devices
```

### Step 2: Install / Update the Application
```powershell
# Install the optimized APK with replace flag (-r) and grant permissions (-g)
adb -s 192.168.1.64:5555 install -r -g "Fun Target React\build_apk\FunTarget_Production_Optimized.apk"
```

### Step 3: Launch the Application
```powershell
# Launch the main activity
adb -s 192.168.1.64:5555 shell am start -n com.funtarget.app/.MainActivity
```

---

## 2. In-Depth Diagnostics & Real-Time Monitoring Commands

### 1. Monitor Total Memory & VRAM Allocation (`dumpsys meminfo`)
To inspect how much RAM and Graphics Memory (EGL/GL mtrack) the application consumes in real time:
```powershell
adb -s 192.168.1.64:5555 shell dumpsys meminfo com.funtarget.app
```
**Key Metric Fields to Inspect:**
- `TOTAL PSS`: Must remain below **200,000 kB** (195 MB). Prior to optimization, this climbed to 480,000+ kB.
- `EGL mtrack / GL mtrack`: Measures actual GPU texture allocations. Should stay between **35,000 kB and 55,000 kB** (35 MB–55 MB). Prior to optimization, this reached 220,000+ kB.
- `Native Heap`: Should stabilize around **35,000 kB – 45,000 kB**.

### 2. Real-Time Memory Polling Loop (Watch for Leaks)
Run this command in PowerShell to observe memory every 30 seconds during continuous gameplay:
```powershell
while ($true) {
    $date = Get-Date -Format "HH:mm:ss"
    $mem = adb -s 192.168.1.64:5555 shell dumpsys meminfo com.funtarget.app | Select-String "TOTAL PSS:"
    Write-Host "[$date] $mem"
    Start-Sleep -Seconds 30
}
```
*Expected Result:* Memory remains flat between 165 MB and 195 MB over hours of play, without monotonic climbing.

### 3. GPU Rendering & Frame Drops (`dumpsys gfxinfo`)
To measure whether frames are dropping during the 6-second wheel spin:
```powershell
adb -s 192.168.1.64:5555 shell dumpsys gfxinfo com.funtarget.app framestats
```
*Expected Result:* 90th percentile frame duration < 16.6ms (maintaining 60 fps without rendering hiccups).

### 4. Logcat Filter for WebView & Memory Warnings
```powershell
adb -s 192.168.1.64:5555 logcat -v time chromium:D MainActivity:D ActivityManager:I *:S
```
**Verify:**
- Native log outputs: `MainActivity: Native Telemetry: Total RAM = ... MB, isLowRam = true`.
- Zero occurrences of `GL_OUT_OF_MEMORY` or `EGL_BAD_ALLOC`.
- Zero occurrences of `lowmemorykiller: Killing 'com.funtarget.app'`.

---

## 3. Account Switching Test Verification Protocol

To verify that the account-switch glitch (`demo2` $\to$ `demo1`) is 100% resolved:

1. **Phase 1: Baseline Session**
   - Log into `demo2`.
   - Play 5 full rounds (5 minutes).
   - Record baseline `TOTAL PSS` (e.g., 172 MB).
2. **Phase 2: Perform Logout**
   - Click the Logout button.
   - Observe `AuthContext.jsx` triggering `clearPermanentImageCache()`, `stopAllSounds()`, and `clearWebViewCache()`.
   - Inspect memory: `TOTAL PSS` drops to ~120 MB.
3. **Phase 3: Log into Second Account (`demo1`)**
   - Enter `demo1` credentials and enter the game.
   - Inspect `TOTAL PSS`: It should settle back to ~175 MB (**NOT** 380 MB).
4. **Phase 4: Verify Wheel and Asset Rendering**
   - Verify that the center logo appears sharp and bright (no black rectangular surfaces).
   - Verify that when the timer reaches 60s, the wheel accelerates smoothly and decelerates into the winning sector at 54s.
   - Verify that no UI freeze or stutter occurs.

