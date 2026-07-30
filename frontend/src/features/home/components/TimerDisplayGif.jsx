import FTlogoGif from "@assets/images/gifs/timerDisplay.gif";

const POS = {
  left: "1.5%",
  top: "32.2%",
  width: "21%",
  height: "8.5%",
};

const GifTimerDisplay = ({ time }) => {
  const show = time >= 10 && time <= 15;

  if (!show) return null;

  return (
    <img
      src={FTlogoGif}
      alt="celebration"
      className="absolute pointer-events-none "
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
export default GifTimerDisplay;
