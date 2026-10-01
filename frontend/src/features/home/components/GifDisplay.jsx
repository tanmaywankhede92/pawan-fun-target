import FTlogoGif from "@assets/images/gifs/FTlogo2.webp";

const POS = {
  left: "0%",
  top: "40%",
  width: "100%",
  height: "40%",
};

const GifDisplay = () => {
  return (
    <img
      decoding="async"
      src={FTlogoGif}
      alt="celebration"
      className="absolute pointer-events-none"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
        zIndex: 10,
      }}
    />
  );
};

export { POS as homeGifPos };
export default GifDisplay;
