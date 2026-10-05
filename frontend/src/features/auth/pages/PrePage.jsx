import { useNavigate } from "react-router-dom";
import prevBg from "@assets/images/background/PrevBG.webp";
import ftLogo from "@assets/images/background/Icon.webp";
import { useAuth } from "@hooks/useAuth";
import { useSound } from "@hooks/useSound";
import { authService } from "@services/auth.service";
import { useEffect, useState, useRef } from "react";
import useGameSessionGuard from "@hooks/useGameSessionGuard";

import wheelImg from "@assets/images/wheel/wheel.webp";
import wheelGif from "@assets/images/gifs/joker_gif1_slow.webp";
import jackpot from "@assets/images/gifs/joker1.webp";
import goldie from "@assets/images/gifs/joker2.webp";
import bonus from "@assets/images/gifs/joker3.webp";
import drum from "@assets/images/gifs/joker4.webp";
import pointerGif from "@assets/images/gifs/DG.webp";

// Post-login lobby: shows PrevBG full-screen with the user's ID + balance
// (from the login data), a FunTarget game list that enters the game on
// click, and a logout button.
const PrePage = () => {
  const navigate = useNavigate();
  const { user, logout, setAuth, refreshBalance } = useAuth();
  const { play, stop, stopBgm } = useSound();
  const [gameActive, setGameActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const gameRef = useRef(null);

  useGameSessionGuard(logout, navigate);

  // Auto-focus "FunTarget game" so on Android TV users can press OK to enter immediately
  useEffect(() => {
    const t = setTimeout(() => {
      if (gameRef.current) {
        gameRef.current.focus();
        setGameActive(true);
      }
    }, 150);
    return () => clearTimeout(t);
  }, []);

  const handleOk = () => {
    play("CLICK");
    navigate("/game");
  };

  const handleLogout = async () => {
    play("CLICK");
    await logout();
    navigate("/login", { replace: true });
  };

  // Posts the balance_received value from the login API to the backend.
  // As soon as it succeeds, the displayed balance is refreshed so the
  // credited amount shows up immediately.
  const handleReceive = async () => {
    const username = user?.username;
    const amount = user?.balance_received;
    if (!username || amount == null) return;
    play("CLICK");
    setSaving(true);
    try {
      await authService.setBalanceReceived({
        username,
        balance_received: amount,
      });
      setAuth({ ...user, balance_received: "0.00" });
      await refreshBalance();
    } catch {
      // leave everything as-is so the user can retry
    } finally {
      setSaving(false);
    }
  };

  // Preload game images in background so /game loads instantly on click.
  useEffect(() => {
    [wheelImg, wheelGif, jackpot, goldie, bonus, drum, pointerGif].forEach(
      (src) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = src;
        document.head.appendChild(link);
      }
    );
  }, []);

  // The lobby must be silent: stop every game/timer sound so nothing that
  // was still playing in the game (or queued for the next gesture) is heard
  // here. Sounds should only start once the user enters the game.
  useEffect(() => {
    for (const name of [
      "TICK",
      "SPIN",
      "WIN",
      "LOSE",
      "TAKE",
      "BET",
      "CANCEL",
      "LOADING",
      "ENTER",
      "EXIT",
      "POPUP",
      "CLICK",
    ]) {
      stop(name);
    }
    stopBgm();
  }, [stop, stopBgm]);

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

      {/* Balance received box */}
      <div
        className="absolute"
        style={{
          ...boxStyle,
          left: "2%",
          top: "65%",
          width: "20%",
          height: "7%",
        }}
      >
        {user?.balance_received ?? "0.00"}
      </div>

      {/* Receive button: posts the login API's balance_received to the
          backend, then refreshes the displayed balance. */}
      <button
        className="absolute cursor-pointer"
        disabled={saving}
        onClick={handleReceive}
        style={{
          ...boxStyle,
          left: "18%",
          top: "57%",
          width: "20%",
          height: "7%",
        }}
      >
        {saving ? "..." : ""}
      </button>

      {/* FunTarget game list box -> click enters the game */}
      <div
        ref={gameRef}
        tabIndex={0}
        role="button"
        data-tv-default="true"
        aria-label="Enter FunTarget Game"
        className="absolute cursor-pointer transition-all duration-150 funtarget-game"
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
          outline: "none",

          textShadow: "0 0 3px #fff, 0 0 6px #fff, 1px 1px 2px #000",

          // Mobile-friendly positioning
          right: "auto",
        }}
        onFocus={() => setGameActive(true)}
        onBlur={() => setGameActive(false)}
        onMouseEnter={() => setGameActive(true)}
        onMouseLeave={() => setGameActive(false)}
        onPointerDown={() => setGameActive(true)}
        onPointerUp={() => setGameActive(false)}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" ||
            e.key === "Select" ||
            e.key === "Ok" ||
            e.keyCode === 13 ||
            e.keyCode === 23
          ) {
            e.preventDefault();
            handleOk();
          }
        }}
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
