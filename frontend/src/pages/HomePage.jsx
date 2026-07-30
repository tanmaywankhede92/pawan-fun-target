import { useAuth } from "@hooks/useAuth";
import HomeOverlay from "@features/home/components/HomeOverlay";
import HomeBackground from "@features/home/components/HomeBackground";
import ScoreDisplay, { scorePos } from "@features/home/components/ScoreDisplay";
import WinnerDisplay, { winnerPos } from "@features/home/components/WinnerDisplay";
import TimerDisplay, { timerPos } from "@features/home/components/TimerDisplay";
import LastWinningData, { lastWinsPos } from "@features/home/components/LastWinningData";
import GifDisplay, { gifPos } from "@features/home/components/GifDisplay";

const DEBUG = false;

const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <HomeOverlay>
      <HomeBackground />

      <ScoreDisplay score={user?.balance || 0} />
      <WinnerDisplay winner={user?.username || "Player"} />
      <TimerDisplay />
      <LastWinningData />
      <GifDisplay />

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
            className="absolute border-2 border-yellow-500 bg-yellow-500/20 flex items-center pointer-events-none"
            style={lastWinsPos}
          >
            <span className="text-yellow-300 text-xs ml-1">Last 10 Wins</span>
          </div>
          <div
            className="absolute border-2 border-purple-500 bg-purple-500/20 flex items-center pointer-events-none"
            style={gifPos}
          >
            <span className="text-purple-300 text-xs ml-1">GIF</span>
          </div>
        </>
      )}
    </HomeOverlay>
  );
};

export default HomePage;
