const POS = {
  left: "0%",
  top: "40%",
  width: "100%",
  height: "40%",
};

// Disabled to eliminate heavy 2.04MB animated WebP CPU/GPU load and avoid duplicate banner artifacts
const GifDisplay = () => {
  return null;
};

export { POS as homeGifPos };
export default GifDisplay;
