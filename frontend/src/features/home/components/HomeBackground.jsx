import homeBg from "@assets/images/home/homeImg.png";

const HomeBackground = () => {
  return (
    <div
      className="absolute inset-0 bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${homeBg})`,
        backgroundSize: "100% 100%",
      }}
    />
  );
};

export default HomeBackground;
