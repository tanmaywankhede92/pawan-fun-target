import homeBg from "@assets/images/home/homeImg.webp";

const HomeOverlay = ({ children }) => {
  return (
    <div
      className="fixed inset-0 overflow-hidden bg-black"
      onContextMenu={(e) => e.preventDefault()}
      style={{
        backgroundImage: `url(${homeBg})`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#000",
      }}
    >
      <div className="relative w-screen h-screen select-none">{children}</div>
    </div>
  );
};

export default HomeOverlay;
