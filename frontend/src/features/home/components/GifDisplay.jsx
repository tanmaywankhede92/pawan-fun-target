import crackerGif from "@assets/images/gifs/FTlogo.gif";

const POS = {
  top: "40%",
  width: "100%",
  height: "40%",
};

const GifDisplay = () => {
  return (
    <img
      src={crackerGif}
      alt="celebration"
      className="absolute pointer-events-none border-2 border-dashed border-purple-400/70"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
      }}
    />
  );
};

export { POS as gifPos };
export default GifDisplay;
