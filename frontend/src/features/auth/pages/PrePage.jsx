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

// Game list thumbnails
import iconFunTarget from "@assets/gamelist/Icon.webp";
import imgTripleFun from "@assets/gamelist/TripleFun.jpeg";
import img7up7Down from "@assets/gamelist/7up7Down.jpeg";
import imgBingo from "@assets/gamelist/Bingo.jpeg";
import imgChampionPoker from "@assets/gamelist/ChampionPoker.jpeg";
import imgChecker from "@assets/gamelist/Checker.jpeg";
import imgFeverJokerBonus from "@assets/gamelist/FeverJokerBonus.jpeg";
import imgFunAndarBahar from "@assets/gamelist/FunAndarBahar.jpeg";
import imgFunAviator from "@assets/gamelist/FunAviator.jpeg";
import imgFunRoulette from "@assets/gamelist/FunRoulette.jpeg";
import imgGiantJackpot from "@assets/gamelist/GiantJackpot.jpeg";
import imgJokerBonus from "@assets/gamelist/JokerBonus.jpeg";
import imgKeno from "@assets/gamelist/Keno.jpeg";
import imgLucky8Line from "@assets/gamelist/Lucky8Line.jpeg";
import imgNohold from "@assets/gamelist/Nohold.jpeg";
import imgSuperGoldenWheel from "@assets/gamelist/SuperGoldenWheel.jpeg";

const GAME_LIST = [
  { id: "funaviator", name: "Fun Aviator", shortName: "Fun Aviator", icon: imgFunAviator, playable: false },
  { id: "7up7down", name: "7Up7Down", shortName: "7Up7Down", icon: img7up7Down, playable: false },
  { id: "funandarbahar", name: "Fun Andar Bahar", shortName: "Fun AB", icon: imgFunAndarBahar, playable: false },
  { id: "triplefun", name: "Triple Fun", shortName: "Triple Fun", icon: imgTripleFun, playable: false },
  { id: "funroulette", name: "Fun Roulette", shortName: "Roulette", icon: imgFunRoulette, playable: false },
  { id: "funtarget", name: "Fun Target", shortName: "Fun Target", icon: iconFunTarget, playable: true },
  { id: "bingo", name: "Bingo", shortName: "Bingo", icon: imgBingo, playable: false },
  { id: "checker", name: "Checker", shortName: "Checker", icon: imgChecker, playable: false },
  { id: "feverjokerbonus", name: "Fever Joker Bonus", shortName: "Fever Joker", icon: imgFeverJokerBonus, playable: false },
  { id: "supergoldenwheel", name: "Super Golden Wheel", shortName: "Golden Wheel", icon: imgSuperGoldenWheel, playable: false },
  { id: "giantjackpot", name: "Giant Jackpot", shortName: "Jackpot", icon: imgGiantJackpot, playable: false },
  { id: "keno", name: "Keno", shortName: "Keno", icon: imgKeno, playable: false },
  { id: "nohold", name: "Nohold", shortName: "Nohold", icon: imgNohold, playable: false },
  { id: "jokerbonus", name: "Joker Bonus", shortName: "Joker Bonus", icon: imgJokerBonus, playable: false },
  { id: "lucky8line", name: "Lucky 8 Line", shortName: "Lucky 8 Line", icon: imgLucky8Line, playable: false },
  { id: "championpoker", name: "Champion Poker", shortName: "Poker", icon: imgChampionPoker, playable: false },
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
  const [noticeMessage, setNoticeMessage] = useState(null);
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
