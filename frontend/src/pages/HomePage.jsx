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
// import ExitConfirmModal from "@features/home/components/ExitConfirmModal"; // exit overlay disabled
// import GameLoadingOverlay from "@features/auth/components/GameLoadingOverlay"; // loading disabled
// import SoundToggle from "@components/common/SoundToggle";
import { useSound } from "@hooks/useSound";
import { toast } from "react-toastify";
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
  const [resultError, setResultError] = useState(false);
  const [selectedValue, setSelectedValue] = useState(10);
  const [bets, setBets] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [resultRevealed, setResultRevealed] = useState(false);
  const [taken, setTaken] = useState(false);
  const [won, setWon] = useState(false);
  const autoSubmitted = useRef(false);

  const totalBet = Object.values(bets).reduce((sum, v) => sum + v, 0);

  // Betting lock: last 10 seconds of the minute + while the wheel is spinning.
  const clickLocked = wheelSpinning || (time <= 10 && time > 0);

  // Take enabled only when the user bet on the winning number.
  const takePending = resultRevealed && !taken && won;

  const handlePanelSelect = useCallback((value) => {
    setSelectedValue(value);
  }, []);

  const handleBet = useCallback(
    (num) => {
      if (selectedValue === null) return;
      // If a winning bet is pending, must take before placing new bets.
      if (takePending) {
        toast.warn("Take your winning first");
        return;
      }
      // A new bet for the next result stops the winner blink and starts
      // a fresh round (old placed bets from the previous draw are cleared).
      if (resultRevealed) {
        setBets({});
        setResultRevealed(false);
        setSubmitted(false);
      }
      setBets((prev) => ({ ...prev, [num]: (prev[num] || 0) + selectedValue }));
    },
    [selectedValue, takePending, resultRevealed],
  );

  const clearBets = useCallback(() => {
    setBets({});
  }, []);

  // Place the bet via the backend. Ticket = "num-amount" pairs.
  const handlePlaceBet = useCallback(async () => {
    const ticket = Object.entries(bets)
      .filter(([, amt]) => amt > 0)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([n, amt]) => `${n}-${amt}`)
      .join(",");

    if (!ticket) {
      toast.warn("Select a number first");
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
        const barcode = data?.ticket?.barcode;
        toast.success(barcode ? `Ticket ${barcode} placed!` : "Bet placed!");
        // Keep showing the placed bets; they clear only on Take.
        setSubmitted(true);
        refreshBalance();
      } else {
        toast.error(data?.message || "Bet failed");
      }
    } catch {
      toast.error("Bet failed. Try again.");
    }
  }, [bets, totalBet, user, clearBets, refreshBalance]);

  // Auto-OK: when the countdown hits the last 10 seconds, submit any
  // pending bets automatically. Runs once per round.
  useEffect(() => {
    if (time > 10) {
      autoSubmitted.current = false;
      return;
    }
    if (time > 0 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      if (!submitted && totalBet > 0) handlePlaceBet();
    }
  }, [time, totalBet, handlePlaceBet, submitted]);

  const handleButtonAction = useCallback(
    async (id) => {
      if (clickLocked && id !== "exit" && id !== "takeBet") return;
      if (id === "cancelBet") clearBets();
      // preview toggles to "OK Bet" once a bet exists -> places the bet
      if (id === "preview" && !submitted && totalBet > 0) await handlePlaceBet();
      // take: claim winnings -> clear placed bets, stop the blinking
      if (id === "takeBet") {
        if (!takePending) return;
        setTaken(true);
        setResultRevealed(false);
        setWon(false);
        setSubmitted(false);
        clearBets();
        refreshBalance();
      }
      // exit overlay disabled - exit directly logs out to login page
      if (id === "exit") {
        await logout();
        navigate("/login", { replace: true });
      }
    },
    [clearBets, handlePlaceBet, totalBet, logout, navigate, clickLocked, refreshBalance, takePending, submitted],
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
    (winner) => {
      setLastWinner(winner);
      setWheelSpinning(false);
      setResultRevealed(true);
      // Won only if a bet was placed on the winning number.
      setWon(Number(bets[winner] || 0) > 0);
      setTaken(false);
    },
    [bets],
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

      <ScoreDisplay score={Math.max(0, (user?.balance || 0) - totalBet)} />
      <TotalBetDisplay total={totalBet} />
      <WinnerDisplay winner={lastWinner} />
      <TimerDisplay time={time} />
      <TimerDisplayGif time={time} />
      <GifDisplay />
      <WheelDisplay
        spinTrigger={spinCount}
        targetWinner={lastWinner}
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
        disabled={clickLocked}
        winnerBlink={resultRevealed && !taken ? lastWinner : null}
      />
      <PanelDisplay
        selectedValue={selectedValue}
        onSelect={handlePanelSelect}
        disabled={clickLocked}
      />
      <ButtonDisplay
        onAction={handleButtonAction}
        hasBets={totalBet > 0}
        disabled={clickLocked}
        takeGlow={takePending}
        submitted={submitted}
      />

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
