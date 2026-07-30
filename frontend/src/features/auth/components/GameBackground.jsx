import loginBg from "@assets/images/login/login-bg.png";

const GameBackground = () => {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};

export default GameBackground;
