import { useNavigate } from "react-router-dom";
import prevBg from "@assets/images/background/PrevBG.webp";
import ftLogo from "@assets/images/background/Icon.png";
import { useAuth } from "@hooks/useAuth";
import { useSound } from "@hooks/useSound";
import { useState } from "react";

// Post-login lobby: shows PrevBG full-screen with the user's ID + balance
// (from the login data), a FunTarget game list that enters the game on
// click, and a logout button.
const PrePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { play } = useSound();
  const [gameActive, setGameActive] = useState(false);

  const handleOk = () => {
    play("CLICK");
    navigate("/game");
  };

  const handleLogout = async () => {
    play("CLICK");
    await logout();
    navigate("/login", { replace: true });
  };

  const boxStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",

    color: "#fff",
    fontSize: "clamp(10px, 1.6vw, 26px)",
    fontFamily: '"Times New Roman", serif',
  };

  return (
    <div
      className="absolute inset-0 select-none"
      style={{
        backgroundImage: `url(${prevBg})`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Username (login id) box */}
      <div
        className="absolute"
        style={{
          ...boxStyle,
          left: "8%",
          top: "0.5%",
          width: "20%",
          height: "7%",
        }}
      >
        {user?.username || ""}
      </div>

      {/* Balance box */}
      <div
        className="absolute"
        style={{
          ...boxStyle,
          left: "32%",
          top: "0.5%",
          width: "20%",
          height: "7%",
        }}
      >
        {Math.max(0, user?.balance || 0)}
      </div>

      {/* FunTarget game list box -> click enters the game */}
      <div
        className="absolute cursor-pointer transition-all duration-150"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "10px",

          // Desktop
          left: "82%",
          top: "8%",

          // IMPORTANT: content ke according width
          width: "14%",
          minWidth: "0",

          padding: "5px 10px",
          boxSizing: "border-box",

          color: "#fff",
          fontSize: "clamp(10px, 1vw, 18px)",
          fontFamily: '"Times New Roman", serif',
          whiteSpace: "nowrap",

          backgroundColor: gameActive ? "#fff" : "transparent",
          border: gameActive ? "1px solid #fff" : "1px solid transparent",

          textShadow: "0 0 3px #fff, 0 0 6px #fff, 1px 1px 2px #000",

          // Mobile-friendly positioning
          right: "auto",
        }}
        onMouseEnter={() => setGameActive(true)}
        onMouseLeave={() => setGameActive(false)}
        onPointerDown={() => setGameActive(true)}
        onPointerUp={() => setGameActive(false)}
        onClick={handleOk}
      >
        <img
          decoding="async"
          src={ftLogo}
          alt="FunTarget"
          className="pointer-events-none"
          style={{
            width: "28px",
            height: "15px",
            objectFit: "contain",
            flexShrink: 0,
          }}
        />

        <div
          style={{
            whiteSpace: "nowrap",
            color: gameActive ? "#000" : "#fff",
          }}
        >
          FunTarget game
        </div>
      </div>

      {/* Logout button -> calls logout API + clears session */}
      <button
        className="absolute cursor-pointer"
        style={{
          ...boxStyle,
          left: "84%",
          top: "94.5%",
          width: "6.6%",
          height: "4.5%",
          // background: "rgba(0,0,0,0.45)",
          // border: "1px solid rgba(255,255,255,0.8)",
          // borderRadius: "6px",
        }}
        onClick={handleLogout}
      ></button>
    </div>
  );
};

export default PrePage;
