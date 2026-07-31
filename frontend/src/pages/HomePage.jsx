import { useState, useEffect, useCallback } from "react";
// import { useAuth } from "@hooks/useAuth";
import HomeOverlay from "@features/home/components/HomeOverlay";
import HomeBackground from "@features/home/components/HomeBackground";
import ScoreDisplay, { scorePos } from "@features/home/components/ScoreDisplay";
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

const DEBUG = false;

const HomePage = () => {
  // const { user } = useAuth();
  const user = { username: "Player", balance: 0 };
  const [phase, setPhase] = useState("timer");
  const [time, setTime] = useState(60);
  const [spinCount, setSpinCount] = useState(0);
  const [lastWinner, setLastWinner] = useState(null);

  useEffect(() => {
    if (phase !== "timer") return;
    if (time === 0) {
      setPhase("spinning");
      setSpinCount((c) => c + 1);
      return;
    }
    const id = setTimeout(() => setTime((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, time]);

  const handleSpinComplete = useCallback((winner) => {
    setLastWinner(winner);
    setTimeout(() => {
      setPhase("timer");
      setTime(60);
    }, 2000);
  }, []);

  return (
    <HomeOverlay>
      <HomeBackground />

      <ScoreDisplay score={user?.balance || 0} />
      <WinnerDisplay winner={user?.username || "Player"} />
      <TimerDisplay time={time} />
      <TimerDisplayGif time={time} />
      <GifDisplay />
      <WheelDisplay spinTrigger={spinCount} onComplete={handleSpinComplete} />
      <LastWinningData />
      <NumberDisplay />
      <PanelDisplay />
      <ButtonDisplay />

      {DEBUG && (
        <>
          <div
            className="absolute border-2 border-red-500 bg-red-500/20 flex items-center pointer-events-none"
            style={scorePos}
          >
            <span className="text-red-300 text-xs ml-1">Score</span>
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
