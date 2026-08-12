import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { resultService } from "@services/result.service";
import HomeOverlay from "@features/home/components/HomeOverlay";
import HomeBackground from "@features/home/components/HomeBackground";
import ScoreDisplay, { scorePos } from "@features/home/components/ScoreDisplay";
import TotalBetDisplay, {
  totalBetPos,
} from "@features/home/components/TotalBetDisplay";
import WinnerDisplay, {
  winnerPos,
} from "@features/home/components/WinnerDisplay";
import TimerDisplay, { timerPos } from "@features/home/components/TimerDisplay";
import LastWinningData, {
  lastWinsPos,
} from "@features/home/components/LastWinningData";
import TimerDisplayGif, {
  gifPos,
} from "@features/home/components/TimerDisplayGif";
import GifDisplay from "../features/home/components/GifDisplay";
import WheelDisplay, { wheelPos } from "@features/home/components/WheelDisplay";
import NumberDisplay from "@features/home/components/NumberDisplay";
import PanelDisplay from "@features/home/components/PanelDisplay";
import ButtonDisplay from "@features/home/components/ButtonDisplay";
import MessageDisplay from "@features/home/components/MessageDisplay";
// import ExitConfirmModal from "@features/home/components/ExitConfirmModal"; // exit overlay disabled
// import GameLoadingOverlay from "@features/auth/components/GameLoadingOverlay"; // loading disabled
// import SoundToggle from "@components/common/SoundToggle";
import { useSound } from "@hooks/useSound";
import { recordService } from "@services/record.service";
import {
  istSeconds,
  secondsToNextMinute,
  istDateStr,
  istTimeStr,
  ist12hStr,
  ist24hStr,
} from "@utils/istTime";

const DEBUG = false;

const HomePage = () => {
  const { user, logout, refreshBalance } = useAuth();
  const navigate = useNavigate();
  const { play, playBgm } = useSound();
  // const [showExitConfirm, setShowExitConfirm] = useState(false); // exit overlay disabled
  const [time, setTime] = useState(() => secondsToNextMinute(istSeconds()));
  const prevSec = useRef(istSeconds());
  const [spinCount, setSpinCount] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [lastWinner, setLastWinner] = useState(null);
  const [lastJoker, setLastJoker] = useState(null);
  const [resultError, setResultError] = useState(false);
  const [selectedValue, setSelectedValue] = useState(10);
  const [bets, setBets] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [resultRevealed, setResultRevealed] = useState(false);
  const [taken, setTaken] = useState(false);
  const [won, setWon] = useState(false);
  const [gameMessage, setGameMessage] = useState(
    "Please Bet to Start Game. Minimum Bet = 20",
  );
  const [cancelMode, setCancelMode] = useState(false);
  const [winInfo, setWinInfo] = useState(null);
  const manualMsg = useRef(false);
  const autoSubmitted = useRef(false);

  const totalBet = Object.values(bets).reduce((sum, v) => sum + v, 0);

  // Betting lock: last 10 seconds of the minute + while the wheel is spinning.
  const clickLocked = wheelSpinning || (time <= 10 && time > 0);

  // Take appears only when there is a WINNING result on the board. No timer
  // condition — the user can Take any time (even in the last seconds).
  const takePending = resultRevealed && !taken && won;

  const handlePanelSelect = useCallback((value) => {
    setSelectedValue(value);
  }, []);

  const handleBet = useCallback(
    (num) => {
      if (selectedValue === null) return;
      // Once a bet is accepted, no further bets until the result arrives.
      if (submitted && !resultRevealed) {
        manualMsg.current = true;
        setGameMessage("Bet already accepted. Wait for the result.");
        return;
      }
      // Cancel-specific mode: clicking a number cancels only that bet.
      if (cancelMode) {
        setBets((prev) => {
          if (!prev[num]) return prev;
          const next = { ...prev };
          delete next[num];
          return next;
        });
        return;
      }
      // If a winning bet is pending, must take before placing new bets.
      if (takePending) {
        manualMsg.current = true;
        setGameMessage("Take your winning first");
        return;
      }
      // A new bet for the next result stops the winner blink and starts
      // a fresh round (old placed bets from the previous draw are cleared).
      if (resultRevealed) {
        setBets({});
        setResultRevealed(false);
        setSubmitted(false);
        setWinInfo(null);
      }
      setBets((prev) => ({ ...prev, [num]: (prev[num] || 0) + selectedValue }));
      // New bet resets the prompt so a stale message never lingers.
      manualMsg.current = false;
      setGameMessage("Please Bet to Start Game. Minimum Bet = 20");
    },
    [selectedValue, takePending, resultRevealed, cancelMode, submitted],
  );

  const clearBets = useCallback(() => {
    setBets({});
  }, []);

  // Auto-exit cancel mode once the last bet is cancelled.
  useEffect(() => {
    if (cancelMode && totalBet === 0) setCancelMode(false);
  }, [cancelMode, totalBet]);

  // Place the bet via the backend. Ticket = "num-amount" pairs.
  const handlePlaceBet = useCallback(async () => {
    const ticket = Object.entries(bets)
      .filter(([, amt]) => amt > 0)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([n, amt]) => `${n}-${amt}`)
      .join(",");

    if (!ticket) {
      manualMsg.current = true;
      setGameMessage("Select a number first");
      return;
    }

    // Minimum bet validation.
    if (totalBet < 20) {
      manualMsg.current = true;
      setGameMessage("Minimum bet amount is 20.");
      return;
    }

    // Balance validation: bet amount cannot exceed balance.
    const balance = user?.balance ?? 0;
    if (totalBet > balance) {
      manualMsg.current = true;
      setGameMessage(
        `Insufficient balance. Total ${totalBet} > Balance ${balance}`,
      );
      return;
    }

    const payload = {
      currentDate: istDateStr(),
      currentTime: istTimeStr(),
      drawTime: ist12hStr(0), // current minute, 12h (frontend style)
      nextdrawTime: ist24hStr(1), // next minute, 24h (backend style)
      ticket,
      qty: totalBet,
      totalAmount: totalBet,
      username: user?.username || "",
    };

    try {
      const { data } = await recordService.insertRecord(payload);
      if (data?.success) {
        manualMsg.current = true;
        setGameMessage("Your Bet has been Accepted");
        // Keep showing the placed bets; they clear only on Take.
        setSubmitted(true);
        setCancelMode(false);
        refreshBalance();
      } else {
        manualMsg.current = true;
        setGameMessage(data?.message || "Bet failed");
      }
    } catch {
      manualMsg.current = true;
      setGameMessage("Bet failed. Try again.");
    }
  }, [bets, totalBet, user, refreshBalance]);

  // Auto-OK: when the countdown hits the last 12 seconds, submit any
  // pending bets automatically. Runs once per round.
  useEffect(() => {
    if (time > 12) {
      autoSubmitted.current = false;
      return;
    }
    if (time > 0 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      // Never auto-place while a winning Take is pending — the old bets
      // must not be resubmitted for the next draw.
      if (!submitted && totalBet > 0 && !takePending) {
        manualMsg.current = true;
        setGameMessage("Your Bet has been Accepted");
        handlePlaceBet();
      }
    }
  }, [time, totalBet, handlePlaceBet, submitted, takePending]);

  // Phase message:
  //   last 10 sec      -> "Bet Time over"
  //   wheel spinning   -> "FOR AMUSEMENT ONLY NO CASH VALUE"
  //   betting window   -> "Please Bet to Start Game. Minimum Bet = 20"
  // Manual messages (validation / accepted) override the betting-window prompt.
  useEffect(() => {
    if (time <= 10 && time > 0) {
      manualMsg.current = false;
      setGameMessage("Bet Time over");
    } else if (wheelSpinning) {
      manualMsg.current = false;
      setGameMessage("FOR AMUSEMENT ONLY NO CASH VALUE");
    } else if (!manualMsg.current && time > 12) {
      setGameMessage("Please Bet to Start Game. Minimum Bet = 20");
    }
  }, [time, wheelSpinning]);

  const handleButtonAction = useCallback(
    async (id) => {
      if (clickLocked && id !== "exit" && id !== "takeBet") return;
      // While a winning Take is pending, only Take works (Exit always works).
      if (takePending && id !== "takeBet" && id !== "exit") return;
      // Once a bet is accepted, nothing works until the result arrives
      // (Exit always works).
      if (submitted && !resultRevealed && id !== "exit") return;
      // Cancel All clears every placed bet.
      // Once the bet is accepted, bets can no longer be cancelled.
      if (submitted && (id === "cancelAll" || id === "cancelSpecific")) {
        manualMsg.current = true;
        setGameMessage("Bet already accepted. Cannot cancel.");
        return;
      }
      if (id === "cancelAll") {
        clearBets();
        setCancelMode(false);
      }
      // Cancel Specific toggles cancel mode: clicking a number removes
      // only that number's bet.
      if (id === "cancelSpecific") {
        setCancelMode((m) => !m);
      }
      // The button is "Prev" with no bets (loads last bet) and "OK Bet"
      // once a bet exists (places the bet).
      if (id === "preview" && !submitted && totalBet > 0) {
        await handlePlaceBet();
        manualMsg.current = true;
        setGameMessage("Your Bet has been Accepted");
      } else if (id === "preview") {
        try {
          const { data } = await recordService.getLastBet({
            username: user?.username || "",
          });
          const rec = data?.records?.[0];
          if (rec?.tck_result) {
            const parsed = {};
            rec.tck_result.split(",").forEach((pair) => {
              const [n, amt] = pair.split("-");
              if (n !== undefined && amt !== undefined) {
                parsed[Number(n)] = (parsed[Number(n)] || 0) + Number(amt);
              }
            });
            setBets(parsed);
            setSubmitted(false);
            setResultRevealed(false);
            setCancelMode(false);
            // No "loaded" message — the previous ticket just appears.
          } else {
            manualMsg.current = true;
            setGameMessage("No previous bet found");
          }
        } catch {
          manualMsg.current = true;
          setGameMessage("Failed to load last bet");
        }
      }
      // take: claim winnings via the backend -> sync balance -> clear bets
      if (id === "takeBet") {
        if (!takePending) return;
        // Ensure we have the winning record before claiming.
        let info = winInfo;
        if (!info?.barcode) {
          try {
            const res = await recordService.winAmount({
              username: user?.username || "",
            });
            info = res?.data?.data || null;
          } catch {
            info = null;
          }
        }
        if (!info?.barcode) {
          manualMsg.current = true;
          setGameMessage("Could not claim winnings. Try again.");
          return;
        }
        try {
          const { data } = await recordService.take({
            username: user?.username || "",
            win_amount: info.win_amount,
            barcode: info.barcode,
            id: info.id,
          });
          if (data?.success === false) {
            manualMsg.current = true;
            setGameMessage(data?.message || "Take failed. Try again.");
            return;
          }
          setTaken(true);
          setResultRevealed(false);
          setWon(false);
          setSubmitted(false);
          setCancelMode(false);
          setWinInfo(null);
          // Balance (winnings included) comes from the backend.
          await refreshBalance();
          clearBets();
        } catch {
          manualMsg.current = true;
          setGameMessage("Take failed. Try again.");
        }
      }
      // exit overlay disabled - exit directly logs out to login page
      if (id === "exit") {
        await logout();
        navigate("/login", { replace: true });
      }
    },
    [
      clearBets,
      handlePlaceBet,
      totalBet,
      logout,
      navigate,
      clickLocked,
      refreshBalance,
      takePending,
      submitted,
      winInfo,
    ],
  );

  // exit overlay disabled
  // const handleExitConfirm = useCallback(async () => {
  //   setShowExitConfirm(false);
  //   await logout();
  //   navigate("/login", { replace: true });
  // }, [logout, navigate]);

  // const handleExitCancel = useCallback(() => {
  //   setShowExitConfirm(false);
  // }, []);

  useEffect(() => {
    let mounted = true;
    refreshBalance();
    const load = async () => {
      try {
        const { data } = await resultService.getCurrentResult();
        const r = data?.result?.[0];
        if (!r) throw new Error("no result");
        if (mounted) {
          setLastWinner(Number(r.result) % 10);
          setLastJoker(Number(r.joker) || null);
          setResultError(false);
        }
      } catch {
        if (mounted) setResultError(true);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [refreshBalance]);

  // Sync countdown to IST minute boundary; at :00 fetch the fresh
  // result + balance. No local/random fallback — on failure show an error.
  const handleNewMinute = useCallback(async () => {
    refreshBalance();
    try {
      const { data } = await resultService.getCurrentResult();
      const r = data?.result?.[0];
      if (!r) throw new Error("no result");
      setLastWinner(Number(r.result) % 10);
      setLastJoker(Number(r.joker) || null);
      setResultError(false);
      setWheelSpinning(true);
      setResultRevealed(false);
      setTaken(false);
      setSpinCount((c) => c + 1);
    } catch {
      setResultError(true);
    }
  }, [refreshBalance]);

  useEffect(() => {
    const id = setInterval(() => {
      const s = istSeconds();
      setTime(secondsToNextMinute(s));
      if (s === 0 && prevSec.current === 59) {
        handleNewMinute();
      }
      prevSec.current = s;
    }, 250);
    return () => clearInterval(id);
  }, [handleNewMinute]);

  const handleSpinComplete = useCallback(
    async (winner) => {
      setLastWinner(winner);
      setWheelSpinning(false);
      setResultRevealed(true);
      // Won only if a bet was placed on the winning number.
      setWon(Number(bets[winner] || 0) > 0);
      setTaken(false);
      // Winning amount only shows when a bet was placed this round.
      if (totalBet <= 0) return;
      try {
        const { data } = await recordService.winAmount({
          username: user?.username || "",
        });
        const amount = Number(data?.data?.win_amount || 0);
        manualMsg.current = true;
        if (amount > 0) {
          setWinInfo(data?.data || null);
          setGameMessage(`You Won Rs. ${amount}`);
        } else {
          // No win this draw -> clear the placed bets automatically.
          setWinInfo(null);
          setWon(false);
          setBets({});
          setSubmitted(false);
          setGameMessage("No winning amount this draw");
        }
      } catch {
        setWinInfo(null);
        manualMsg.current = true;
        setGameMessage("Failed to load winning amount");
      }
    },
    [bets, totalBet, user],
  );

  useEffect(() => {
    if (time > 10 || time <= 0) return;
    play("TICK");
  }, [time, play]);

  useEffect(() => {
    const start = () => {
      playBgm();
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, [playBgm]);

  return (
    <HomeOverlay>
      <HomeBackground />

      <ScoreDisplay score={Math.max(0, user?.balance || 0)} />
      <TotalBetDisplay total={totalBet} />
      <WinnerDisplay winner={lastWinner} winAmount={winInfo?.win_amount} />
      <TimerDisplay time={time} />
      <TimerDisplayGif time={time} />
      <GifDisplay />
      <WheelDisplay
        spinTrigger={spinCount}
        targetWinner={lastWinner}
        joker={lastJoker}
        onComplete={handleSpinComplete}
      />
      {resultError && (
        <div
          className="absolute pointer-events-none text-red-600 text-center z-40"
          style={{
            left: "50%",
            top: "62%",
            transform: "translateX(-50%)",
            fontSize: "clamp(10px, 2vw, 24px)",
            fontFamily: '"Times New Roman", serif',
            fontWeight: 700,
            textShadow: "0 0 4px #fff, 0 0 8px #fff",
          }}
        >
          Result load failed. Try again next minute.
        </div>
      )}
      <LastWinningData hidden={wheelSpinning} />
      <NumberDisplay
        bets={bets}
        onBet={handleBet}
        disabled={clickLocked || takePending || (submitted && !resultRevealed)}
        winnerBlink={resultRevealed && !taken ? lastWinner : null}
      />
      <PanelDisplay
        selectedValue={selectedValue}
        onSelect={handlePanelSelect}
        disabled={clickLocked || takePending || (submitted && !resultRevealed)}
      />
      <ButtonDisplay
        onAction={handleButtonAction}
        hasBets={totalBet > 0}
        disabled={clickLocked || (submitted && !resultRevealed)}
        takeGlow={takePending}
        takeLock={takePending}
        submitted={submitted}
        cancelMode={cancelMode}
      />
      <MessageDisplay message={gameMessage} />

      {/* <ExitConfirmModal
        open={showExitConfirm}
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
      /> */}

      {/* <SoundToggle /> */}

      {DEBUG && (
        <>
          <div
            className="absolute border-2 border-red-500 bg-red-500/20 flex items-center pointer-events-none"
            style={scorePos}
          >
            <span className="text-red-300 text-xs ml-1">Score</span>
          </div>
          <div
            className="absolute border-2 border-orange-500 bg-orange-500/20 flex items-center pointer-events-none"
            style={totalBetPos}
          >
            <span className="text-orange-300 text-xs ml-1">Total Bet</span>
          </div>
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/20 flex items-center pointer-events-none"
            style={winnerPos}
          >
            <span className="text-blue-300 text-xs ml-1">Winner</span>
          </div>
          <div
            className="absolute border-2 border-green-500 bg-green-500/20 flex items-center pointer-events-none"
            style={timerPos}
          >
            <span className="text-green-300 text-xs ml-1">Timer</span>
          </div>
          <div
            className="absolute border-2 border-purple-500 bg-purple-500/20 flex items-center pointer-events-none"
            style={gifPos}
          >
            <span className="text-purple-300 text-xs ml-1">GIF</span>
          </div>
          <div
            className="absolute border-2 border-cyan-500 bg-cyan-500/20 flex items-center pointer-events-none"
            style={wheelPos}
          >
            <span className="text-cyan-300 text-xs ml-1">Wheel</span>
          </div>
          <div
            className="absolute border-2 border-yellow-500 bg-yellow-500/20 flex items-center pointer-events-none"
            style={lastWinsPos}
          >
            <span className="text-yellow-300 text-xs ml-1">Last 10 Wins</span>
          </div>
        </>
      )}
    </HomeOverlay>
  );
};

export default HomePage;
