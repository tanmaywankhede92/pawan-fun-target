import loginBg from "@assets/images/login/login-bg.png";

const GameBackground = () => {
  return (
    <div
      className="absolute inset-0 bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "100% 100%",
      }}
    />
  );
};

export default GameBackground;
