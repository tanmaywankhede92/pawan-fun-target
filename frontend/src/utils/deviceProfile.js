export const isLowSpecAndroidTv = () => {
  if (typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent || '';
  const isAndroidTv = /Android/i.test(ua) && (
    /TV|GoogleTV|AndroidTV|SmartTV|BRAVIA|AFT|MiTV|NetCast|Tizen|WebOS/i.test(ua) ||
    !/Mobile/i.test(ua)
  );

  const isLowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
  const hasTinyRam = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;

  return Boolean(isAndroidTv || isLowMemory || hasTinyRam);
};

export const applyLowSpecDeviceProfile = () => {
  if (typeof document === 'undefined') return false;

  const lowSpec = isLowSpecAndroidTv();
  document.body.classList.toggle('low-spec-device', lowSpec);
  document.documentElement.style.setProperty('--tv-low-spec', lowSpec ? '1' : '0');
  return lowSpec;
};
