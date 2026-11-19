export const DEVICE_TIER = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

let cachedProfile = null;

export const getDeviceProfile = () => {
  if (cachedProfile) return cachedProfile;
  if (typeof window === 'undefined') {
    return { tier: DEVICE_TIER.HIGH, isTv: false, isLowSpec: false };
  }

  let totalRamMb = -1;
  let isLowRam = false;
  let memoryClass = -1;
  let isNativeTv = false;

  if (window.Android) {
    try {
      if (typeof window.Android.getTotalRamMb === 'function') {
        totalRamMb = window.Android.getTotalRamMb();
      }
      if (typeof window.Android.isLowRamDevice === 'function') {
        isLowRam = Boolean(window.Android.isLowRamDevice());
      }
      if (typeof window.Android.getMemoryClass === 'function') {
        memoryClass = window.Android.getMemoryClass();
      }
      if (typeof window.Android.isAndroidTV === 'function') {
        isNativeTv = Boolean(window.Android.isAndroidTV());
      }
    } catch {
      // Fallback to web heuristics
    }
  }

  const isAndroidApp =
    (typeof window !== "undefined" && Boolean(window.Android)) ||
    (typeof window !== "undefined" && Boolean(window.Capacitor?.isNativePlatform?.()));

  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  const isDesktop = !isAndroidApp && /Windows NT|Macintosh|Mac OS X(?!.*Mobile)|CrOS|X11; Linux x86_64/i.test(ua);
  const isTv =
    isNativeTv ||
    /TV|GoogleTV|AndroidTV|SmartTV|BRAVIA|AFT|MiTV|NetCast|Tizen|WebOS/i.test(ua) ||
    (/Android/i.test(ua) && !/Mobile/i.test(ua));

  // Desktop Web: Always HIGH tier (full visual experience)
  if (isDesktop && !isTv) {
    cachedProfile = {
      tier: DEVICE_TIER.HIGH,
      isTv: false,
      isLowSpec: false,
      totalRamMb,
      memoryClass,
    };
    return cachedProfile;
  }

  // Low-spec TV / Device Detection:
  // - Authoritative native RAM reported <= 2048 MB (T95 Box typically 1GB-2GB)
  // - Native isLowRamDevice() == true
  // - Native memoryClass <= 192 MB
  // - Web navigator.deviceMemory <= 2 GB
  // - Hardware concurrency <= 4 cores on TV
  const hasLowRamSignal =
    (totalRamMb > 0 && totalRamMb <= 2200) ||
    isLowRam ||
    (memoryClass > 0 && memoryClass <= 192);

  const webLowRam =
    typeof navigator !== 'undefined' &&
    typeof navigator.deviceMemory === 'number' &&
    navigator.deviceMemory <= 2;

  const webLowCpu =
    typeof navigator !== 'undefined' &&
    typeof navigator.hardwareConcurrency === 'number' &&
    navigator.hardwareConcurrency <= 4;

  // On ANY TV platform (Android TV / T-95 TV Box / FireTV / Smart TV), the GPU is an integrated
  // embedded SoC (Mali-450 / Mali-G31) with shared unified memory and a strict ~128MB texture aperture.
  // Regardless of whether total physical RAM is 2GB or 4GB, ALL TVs must use the memory-safe profile
  // (static logo banner, unmounted stationary wheelGif, 10f timer bulbs) to prevent 128MB VRAM overflow
  // and eliminate all black screen glitches and 105ms frame stutters.
  if (isTv) {
    cachedProfile = {
      tier: DEVICE_TIER.LOW,
      isTv: true,
      isLowSpec: true,
      totalRamMb,
      memoryClass,
    };
    return cachedProfile;
  }

  // Mobile Phones: High or Medium
  const isHighEndMobile =
    typeof navigator !== 'undefined' &&
    typeof navigator.deviceMemory === 'number' &&
    navigator.deviceMemory >= 6;

  cachedProfile = {
    tier: isHighEndMobile ? DEVICE_TIER.HIGH : DEVICE_TIER.MEDIUM,
    isTv: false,
    isLowSpec: false,
    totalRamMb,
    memoryClass,
  };
  return cachedProfile;
};

export const isLowSpecAndroidTv = () => {
  return getDeviceProfile().isLowSpec;
};

export const applyLowSpecDeviceProfile = () => {
  if (typeof document === 'undefined') return false;

  const profile = getDeviceProfile();
  document.body.classList.toggle('low-spec-device', profile.isLowSpec);
  document.body.classList.toggle('device-tier-low', profile.tier === DEVICE_TIER.LOW);
  document.body.classList.toggle('device-tier-medium', profile.tier === DEVICE_TIER.MEDIUM);
  document.body.classList.toggle('device-tier-high', profile.tier === DEVICE_TIER.HIGH);
  document.documentElement.style.setProperty('--tv-low-spec', profile.isLowSpec ? '1' : '0');
  return profile.isLowSpec;
};
