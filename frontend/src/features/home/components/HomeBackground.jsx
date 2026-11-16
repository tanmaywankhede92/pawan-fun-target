import homeBg from "@assets/images/home/homeImg.webp";

const HomeBackground = () => {
  return (
    <img
      src={homeBg}
      alt="game background"
      decoding="async"
      fetchPriority="high"
      className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
    />
  );
};

export default HomeBackground;
