// Warms every bundled image in the background at boot so the game screen
// has them cached/decoded by the time it mounts. No UI impact.
const images = import.meta.glob('../assets/images/**/*.{png,jpg,jpeg,webp,gif}', {
  eager: true,
});

const preloadImages = () => {
  if (typeof window === 'undefined') return;
  for (const key of Object.keys(images)) {
    const src = images[key].default;
    if (!src) continue;
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  }
};

preloadImages();
