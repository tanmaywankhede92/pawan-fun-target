import homeBg from "@assets/images/home/homeImg.webp";

const HomeBackground = () => {
  return (
    <img
      src={homeBg}
      alt="game background"
      decoding="async"
      className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
      style={{
        transform: "translateZ(0)",
        willChange: "transform",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    />
  );
};

export default HomeBackground;
