import { clearPermanentImageCache } from './preloadImages';

/**
 * Perform a safe, silent memory & cache purge.
 * 
 * Clears:
 * 1. Android WebView resource cache & initiates native GC.
 * 2. D b
 * \
 *    . V8 GC flags).
 */
export const purgeMemoryCache = () => {
  try {
    if (typeof window !== 'undefined' && window.Android && typeof window.Android.clearWebViewCache === 'function') {
      window.Android.clearWebViewCache();
    }
  } catch (e) {
    // ignore
  }

  try {
    clearPermanentImageCache();
  } catch (e) {
    // ignore
  }

  try {
    if (typeof window !== 'undefined' && typeof window.gc === 'function') {
      window.gc();
    }
  } catch (e) {
    // ignore
  }
};

// Wire OS onTrimMemory signal directly to cache purge
if (typeof window !== 'undefined') {
  window.__onTrimMemory = (_level) => {
    try {
      purgeMemoryCache();
    } catch (e) { }
  };
}

