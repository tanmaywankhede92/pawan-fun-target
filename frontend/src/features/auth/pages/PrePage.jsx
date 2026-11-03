import { useNavigate } from "react-router-dom";
import prevBg from "@assets/images/background/PrevBG.webp";
import { useAuth } from "@hooks/useAuth";
import { useSound } from "@hooks/useSound";
import { authService } from "@services/auth.service";
import { useEffect, useState, useRef, useCallback } from "react";
import useGameSessionGuard from "@hooks/useGameSessionGuard";

import homeBg from "@assets/images/home/homeImg.webp";
import wheelImg from "@assets/images/wheel/wheel.webp";
import wheelGif from "@assets/images/gifs/joker_gif1_slow.webp";
import jackpot from "@assets/images/gifs/joker1.webp";
import goldie from "@assets/images/gifs/joker2.webp";
import bonus from "@assets/images/gifs/joker3.webp";
import drum from "@assets/images/gifs/joker4.webp";
import pointerGif from "@assets/images/gifs/DG.gif";

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
  const [refreshGlow, setRefreshGlow] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const refreshRef = useRef(null);
  const gameRef = useRef(null);
  const receiveRef = useRef(null);
  const rejectRef = useRef(null);
  const shieldRef = useRef(null);
  const logoutRef = useRef(null);
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
    // Gently pre-warm critical game background and wheel image in background
    // after PrePage has painted, so opening PrePage is instantaneous on Android TV
    const timer = setTimeout(() => {
      [homeBg, wheelImg].forEach((src) => {
        if (!src) return;
        const img = new Image();
        img.src = src;
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  // Auto-focus "FunTarget game" so on Android TV users can press OK to enter immediately
  useEffect(() => {
    const t = setTimeout(() => {
      if (gameRef.current) {
        gameRef.current.focus({ preventScroll: true });
        setSelectedGameId("funtarget");
        gameRef.current.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
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

  const handleLogout = useCallback(async () => {
    play("CLICK");
    await logout();
    navigate("/login", { replace: true });
  }, [play, logout, navigate]);

  // Global Escape key: close transfer modal if open, otherwise logout (go back to login)
  useEffect(() => {
    const handleGlobalEsc = (e) => {
      if (e.repeat) return;
      if (e.key === "Escape" || e.key === "Esc" || e.keyCode === 27) {
        if (transferOpen) {
          setTransferOpen(false);
        } else {
          handleLogout();
        }
      }
    };
    window.addEventListener("keydown", handleGlobalEsc);
    return () => window.removeEventListener("keydown", handleGlobalEsc);
  }, [transferOpen, handleLogout]);

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
  const handleRefresh = async () => {
    play("CLICK");
    setRefreshGlow(true);
    setTimeout(() => setRefreshGlow(false), 450);
    setRefreshing(true);
    try {
      await refreshBalance();
    } catch {
    } finally {
      setRefreshing(false);
    }
  };

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

      {/* Balance received box: only show when positive amount exists */}
      {Number(user?.balance_received || 0) > 0 && (
        <div
          className="absolute"
          style={{
            ...boxStyle,
            left: "4.5%",
            top: "65.5%",
            width: "14%",
            height: "6%",
          }}
        >
          {user?.balance_received}
        </div>
      )}

      {/* Receive button: posts the login API's balance_received to the
          backend, then refreshes the displayed balance. */}
      <button
        ref={receiveRef}
        tabIndex={0}
        className={`absolute cursor-pointer prepage-receive-btn ${receiveGlow ? "glowing" : ""} ${saving ? "saving" : ""}`}
        disabled={saving}
        onClick={handleReceive}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            rejectRef.current?.focus();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            shieldRef.current?.focus();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            gameRef.current?.focus();
          } else if (e.key === "Enter" || e.key === "Select" || e.key === "Ok" || e.keyCode === 13 || e.keyCode === 23) {
            e.preventDefault();
            handleReceive();
          }
        }}
        aria-label="Receive points"
        style={{
          left: "24.5%",
          top: "58%",
          width: "7.5%",
          height: "5.5%",
          zIndex: 20,
        }}
      >
        {saving ? "..." : ""}
      </button>

      {/* Reject button: calls balance_reject API to reject/refund pending received points */}
      <button
        ref={rejectRef}
        tabIndex={0}
        className={`absolute cursor-pointer prepage-reject-btn ${rejectGlow ? "glowing" : ""} ${rejecting ? "rejecting" : ""}`}
        disabled={rejecting}
        onClick={handleReject}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            receiveRef.current?.focus();
          } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            shieldRef.current?.focus();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            gameRef.current?.focus();
          } else if (e.key === "Enter" || e.key === "Select" || e.key === "Ok" || e.keyCode === 13 || e.keyCode === 23) {
            e.preventDefault();
            handleReject();
          }
        }}
        aria-label="Reject points"
        style={{
          ...boxStyle,
          left: "38%",
          top: "58%",
          width: "7.5%",
          height: "5.5%",
          zIndex: 20,
        }}
      >
        {rejecting ? "..." : ""}
      </button>

      {/* Transparent hit area over the Point Transfer shield in PrevBG with magical fiery glow. */}
      <button
        ref={shieldRef}
        type="button"
        tabIndex={0}
        className={`absolute cursor-pointer prepage-transfer-shield-btn ${transferGlow ? "glowing" : ""}`}
        aria-label="Open point transfer"
        onClick={handleOpenTransfer}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            rejectRef.current?.focus();
          } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            gameRef.current?.focus();
          } else if (e.key === "Enter" || e.key === "Select" || e.key === "Ok" || e.keyCode === 13 || e.keyCode === 23) {
            e.preventDefault();
            handleOpenTransfer();
          }
        }}
        style={{
          left: "43.5%",
          top: "17.5%",
          width: "14%",
          height: "20%",
          zIndex: 20,
        }}
      />

      <PointTransferModal
        open={transferOpen}
        onClose={() => {
          setTransferOpen(false);
          setTimeout(() => shieldRef.current?.focus(), 50);
        }}
        user={user}
        onTransferSuccess={handleTransferSuccess}
      />

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
              ref={game.id === "funtarget" ? gameRef : null}
              tabIndex={0}
              role="button"
              data-tv-default={game.id === "funtarget" ? "true" : undefined}
              aria-label={game.name}
              className={`prepage-game-item ${isActive ? "active" : ""}`}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                width: "100%",
                height: "28px",
                minHeight: "28px",
                maxHeight: "28px",
                padding: "2px 6px",
                boxSizing: "border-box",
                borderRadius: "3px",
                overflow: "hidden",
                flexShrink: 0,
                border: "none",
              }}
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
                if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  shieldRef.current?.focus();
                } else if (
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
                loading={game.id === "funtarget" ? "eager" : "lazy"}
                src={game.icon}
                alt={game.name}
                className="pointer-events-none"
                style={{
                  width: "32px",
                  minWidth: "32px",
                  maxWidth: "32px",
                  height: "20px",
                  minHeight: "20px",
                  maxHeight: "20px",
                  flex: "0 0 32px",
                  objectFit: "cover",
                  border: "1px solid #ffffff",
                  borderRadius: "2px",
                  display: "block",
                  marginRight: "12px",
                }}
              />
              <span
                className="prepage-game-title"
                style={{
                  flex: "1 1 auto",
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.1,
                  textAlign: "left",
                }}
              >
                {game.shortName || game.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Refresh button -> calls refreshBalance() */}
      <button
        ref={refreshRef}
        tabIndex={0}
        className={`absolute cursor-pointer prepage-refresh-btn ${refreshGlow ? "glowing" : ""} ${refreshing ? "refreshing" : ""}`}
        disabled={refreshing}
        style={{
          left: "7.5%",
          top: "94.5%",
          width: "7.5%",
          height: "4.5%",
          zIndex: 20,
        }}
        onClick={handleRefresh}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" ||
            e.key === "Select" ||
            e.key === "Ok" ||
            e.keyCode === 13 ||
            e.keyCode === 23
          ) {
            e.preventDefault();
            handleRefresh();
          }
        }}
        aria-label="Refresh balance"
      >
        {refreshing ? "..." : ""}
      </button>

      {/* Logout button -> calls logout API + clears session */}
      <button
        ref={logoutRef}
        tabIndex={0}
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
        onKeyDown={(e) => {
          if (
            e.key === "Enter" ||
            e.key === "Select" ||
            e.key === "Ok" ||
            e.keyCode === 13 ||
            e.keyCode === 23
          ) {
            e.preventDefault();
            handleLogout();
          }
        }}
      ></button>
    </div>
  );
};

export default PrePage;
