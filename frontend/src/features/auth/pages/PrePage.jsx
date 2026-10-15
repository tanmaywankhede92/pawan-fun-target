import { useNavigate } from "react-router-dom";
import prevBg from "@assets/images/background/PrevBG.webp";
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

import PointTransferModal from "../components/PointTransferModal";

// Game list thumbnails
import iconFunTarget from "@assets/gamelist/Icon.webp";

const GAME_LIST = [
  { id: "funtarget", name: "Fun Target", shortName: "Fun Target", icon: iconFunTarget, playable: true },
];

// Post-login lobby: shows PrevBG full-screen with the user's ID + balance
// (from the login data), a scrollable game list that enters the game on
// click, and a logout button.
const PrePage = () => {
  const navigate = useNavigate();
  const { user, logout, setAuth, refreshBalance } = useAuth();
  const { play, stop, stopBgm } = useSound();
  const [selectedGameId, setSelectedGameId] = useState("funtarget");
  const [hoveredGameId, setHoveredGameId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [receiveGlow, setReceiveGlow] = useState(false);
  const [rejectGlow, setRejectGlow] = useState(false);
  const [transferGlow, setTransferGlow] = useState(false);
  const gameRef = useRef(null);
  const noticeTimerRef = useRef(null);

  useGameSessionGuard(logout, navigate);

  const showNotice = (msg) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setNoticeMessage(msg);
    noticeTimerRef.current = setTimeout(() => {
      setNoticeMessage(null);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  // Auto-focus "FunTarget game" so on Android TV users can press OK to enter immediately
  useEffect(() => {
    const t = setTimeout(() => {
      if (gameRef.current) {
        gameRef.current.focus({ preventScroll: true });
        setSelectedGameId("funtarget");
      }
    }, 150);
    return () => clearTimeout(t);
  }, []);

  const handleGameSelect = (game) => {
    play("CLICK");
    if (game.playable) {
      navigate("/game");
    } else {
      showNotice(`${game.name} `);
    }
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
    play("CLICK");
    setReceiveGlow(true);
    setTimeout(() => setReceiveGlow(false), 450);

    const username = user?.username;
    const amount = user?.balance_received;
    if (!username || amount == null || Number(amount) <= 0) return;
    setSaving(true);
    try {
      await authService.setBalanceReceived({
        username,
        balance_received: amount,
      });
      setAuth({ ...user, balance_received: "0.00" });
      await refreshBalance();
      play("TAKE");
    } catch {
      // leave everything as-is so the user can retry
    } finally {
      setSaving(false);
    }
  };

  // Posts to balance_reject to reject/refund any pending received balance back to sponsor/agent.
  const handleReject = async () => {
    play("CLICK");
    setRejectGlow(true);
    setTimeout(() => setRejectGlow(false), 450);

    const username = user?.username;
    const amount = user?.balance_received;
    if (!username || amount == null || Number(amount) <= 0) return;
    setRejecting(true);
    try {
      const res = await authService.rejectBalance(username);
      const remaining = res?.data?.data?.remaining_balance_received ?? "0.00";
      setAuth({
        ...user,
        balance_received: typeof remaining === "number" ? remaining.toFixed(2) : remaining,
      });
      await refreshBalance();
      play("CANCEL");
    } catch {
      // leave everything as-is so the user can retry
    } finally {
      setRejecting(false);
    }
  };

  const handleOpenTransfer = () => {
    play("CLICK");
    setTransferGlow(true);
    setTimeout(() => setTransferGlow(false), 450);
    setTransferOpen(true);
  };

  const handleTransferSuccess = async (data) => {
    const remaining = data?.data?.remaining_balance;
    if (remaining != null && !isNaN(Number(remaining))) {
      setAuth({ ...user, balance: Number(remaining) });
    }
    await refreshBalance();
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
          justifyContent: "flex-start",
          textAlign: "left",
          left: "15.5%",
          top: "0.5%",
          width: "12.5%",
          height: "6%",
          paddingLeft: "4px",
        }}
      >
        {user?.username || ""}
      </div>

      {/* Balance box */}
      <div
        className="absolute"
        style={{
          ...boxStyle,
          justifyContent: "flex-start",
          textAlign: "left",
          left: "38.5%",
          top: "0.5%",
          width: "12.5%",
          height: "6%",
          paddingLeft: "4px",
        }}
      >
        {Math.max(0, user?.balance || 0)}
      </div>

      {/* Balance received box */}
      <div
        className="absolute"
        style={{
          ...boxStyle,
          left: "6.5%",
          top: "64.5%",
          width: "16%",
          height: "6%",
        }}
      >
        {user?.balance_received ?? "0.00"}
      </div>

      {/* Receive button: posts the login API's balance_received to the
          backend, then refreshes the displayed balance. */}
      <button
        className={`absolute cursor-pointer prepage-receive-btn ${receiveGlow ? "glowing" : ""} ${saving ? "saving" : ""}`}
        disabled={saving}
        onClick={handleReceive}
        aria-label="Receive points"
        style={{
          ...boxStyle,
          left: "24.2%",
          top: "56.5%",
          width: "7.8%",
          height: "6.5%",
          zIndex: 20,
        }}
      >
        {saving ? "..." : ""}
      </button>

      {/* Reject button: calls balance_reject API to reject/refund pending received points */}
      <button
        className={`absolute cursor-pointer prepage-reject-btn ${rejectGlow ? "glowing" : ""} ${rejecting ? "rejecting" : ""}`}
        disabled={rejecting}
        onClick={handleReject}
        aria-label="Reject points"
        style={{
          ...boxStyle,
          left: "38.5%",
          top: "56.5%",
          width: "7.5%",
          height: "6.5%",
          zIndex: 20,
        }}
      >
        {rejecting ? "..." : ""}
      </button>

      {/* Transparent hit area over the Point Transfer shield in PrevBG with magical fiery glow. */}
      <button
        type="button"
        className={`absolute cursor-pointer prepage-transfer-shield-btn ${transferGlow ? "glowing" : ""}`}
        aria-label="Open point transfer"
        onClick={handleOpenTransfer}
        style={{
          left: "40.5%",
          top: "13%",
          width: "21%",
          height: "31%",
          zIndex: 20,
        }}
      />

      <PointTransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        user={user}
        onTransferSuccess={handleTransferSuccess}
      />

      {/* Notice Banner (for coming soon games) */}
      {/* {noticeMessage && (
        <div
          style={{
            position: "fixed",
            top: "12%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(10, 10, 10, 0.92)",
            border: "2px solid #ffd700",
            color: "#ffd700",
            padding: "8px 22px",
            borderRadius: "8px",
            fontSize: "clamp(13px, 1.2vw, 19px)",
            fontFamily: '"Times New Roman", serif',
            fontWeight: "bold",
            boxShadow: "0 4px 18px rgba(0,0,0,0.85), 0 0 10px rgba(255,215,0,0.5)",
            zIndex: 9999,
            pointerEvents: "none",
            letterSpacing: "0.5px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>⏳</span>
          <span>{noticeMessage}</span>
        </div>
      )} */}

      {/* Scrollable Game List inside wooden ladder frame */}
      <div
        className="prepage-games-container"
        role="region"
        aria-label="Games List"
      >
        {GAME_LIST.map((game, idx) => {
          const isSelected = selectedGameId === game.id;
          const isHovered = hoveredGameId === game.id;
          const isActive = isSelected || isHovered;

          return (
            <div
              key={game.id}
              ref={idx === 0 ? gameRef : null}
              tabIndex={0}
              role="button"
              data-tv-default={idx === 0 ? "true" : undefined}
              aria-label={game.name}
              className={`prepage-game-item  ${isActive ? "active" : ""}`}
              onFocus={(e) => {
                setSelectedGameId(game.id);
                e.currentTarget.scrollIntoView({
                  block: "nearest",
                  behavior: "smooth",
                });
              }}
              onMouseEnter={() => setHoveredGameId(game.id)}
              onMouseLeave={() => setHoveredGameId(null)}
              onClick={() => handleGameSelect(game)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" ||
                  e.key === "Select" ||
                  e.key === "Ok" ||
                  e.keyCode === 13 ||
                  e.keyCode === 23
                ) {
                  e.preventDefault();
                  handleGameSelect(game);
                }
              }}
            >
              <img
                decoding="async"
                src={game.icon}
                alt={game.name}
                className="pointer-events-none"
              />
              <span className="prepage-name-desktop">{game.name}</span>
              <span className="prepage-name-mobile">{game.shortName || game.name}</span>
            </div>
          );
        })}
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
          background: "transparent",
          backgroundColor: "transparent",
          border: "none",
          outline: "none",
          boxShadow: "none",
        }}
        onClick={handleLogout}
      ></button>
    </div>
  );
};

export default PrePage;
