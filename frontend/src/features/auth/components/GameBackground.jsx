import loginBg from "@assets/images/login/login-bg.png";
import loginBgGlow from "@assets/images/login/login-bg-glow.png";

const GameBackground = ({ isCloseActive = false }) => {
  return (
    <div
      className="absolute inset-0 select-none pointer-events-none ft-login-bg"
      style={{ zIndex: 0 }}
    >
      {/* 1. Base normal background - always mounted and cached */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: "100% 100%",
        }}
      />

      {/* 2. Glow background layer - exact match to login-bg quality, glowing Close only */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat transition-opacity duration-75 ease-out"
        style={{
          backgroundImage: `url(${loginBgGlow})`,
          backgroundSize: "100% 100%",
          opacity: isCloseActive ? 1 : 0,
        }}
      />
    </div>
  );
};

export default GameBackground;
