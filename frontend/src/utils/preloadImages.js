import { applyLowSpecDeviceProfile } from './deviceProfile';

const lowSpecDevice = applyLowSpecDeviceProfile();

// On low-spec Android TV devices, skip heavy image preloading to reduce RAM
// and CPU pressure. The app still works normally because assets are loaded on demand.
const images = import.meta.glob('../assets/images/**/*.{png,jpg,jpeg,webp,gif}', {
  eager: true,
});

const preloadImages = () => {
  if (typeof window === 'undefined') return;
  if (lowSpecDevice) return;

  for (const key of Object.keys(images)) {
    const src = images[key].default;
    if (!src) continue;
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  }
};

preloadImages();
