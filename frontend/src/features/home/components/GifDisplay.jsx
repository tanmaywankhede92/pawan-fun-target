import { memo } from "react";
import FTlogoGif from "@assets/images/gifs/FTlogo2.webp";
import FTlogoStatic from "@assets/images/gifs/FTlogo2_static.webp";
import { isLowSpecAndroidTv } from "@utils/deviceProfile";

const POS = {
  left: "0%",
  top: "41.5%",
  width: "100%",
  height: "38.2%",
};

const GifDisplay = () => {
  const isLowSpec = isLowSpecAndroidTv();
  const imgSrc = isLowSpec ? FTlogoStatic : FTlogoGif;

  return (
    <img
      decoding="async"
      src={imgSrc}
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
export default memo(GifDisplay);

