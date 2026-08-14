import { useNavigate } from "react-router-dom";
import prevBg from "@assets/images/background/PrevBG.webp";
import { useAuth } from "@hooks/useAuth";
import { useSound } from "@hooks/useSound";

// Post-login lobby: shows PrevBG full-screen with the user's ID + balance
// (from the login data), a FunTarget game list, and an OK button that
// enters the game.
const PrePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { play } = useSound();

  const handleOk = () => {
    play("CLICK");
    navigate("/game");
  };

  const boxStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",

    color: "#fff",
    fontSize: "clamp(10px, 1.5vw, 22px)",
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
          top: "0%",
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
          left: "31%",
          top: "30%",
          width: "20%",
          height: "7%",
        }}
      >
        {Math.max(0, user?.balance || 0)}
      </div>

      {/* FunTarget game list box */}
      <div
        className="absolute"
        style={{
          ...boxStyle,
          flexDirection: "column",
          left: "82%",
          top: "0%",
          width: "10%",
          height: "20%",
        }}
      >
        <div>FunTarget game</div>
      </div>

      {/* OK button -> /game */}
      <button
        className="absolute cursor-pointer"
        style={{
          ...boxStyle,
          left: "20%",
          top: "70%",
          width: "8%",
          height: "7%",
          background: "rgba(0,0,0,0.45)",
        }}
        onClick={handleOk}
      >
        OK
      </button>
    </div>
  );
};

export default PrePage;
