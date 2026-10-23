import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import WheelDisplay, { wheelPos } from "@features/home/components/WheelDisplay";
import GifDisplay from "@features/home/components/GifDisplay";
import NumberDisplay from "@features/home/components/NumberDisplay";
import PanelDisplay from "@features/home/components/PanelDisplay";
import ButtonDisplay from "@features/home/components/ButtonDisplay";
import MessageDisplay from "@features/home/components/MessageDisplay";
// import ExitConfirmModal from "@features/home/components/ExitConfirmModal"; // exit overlay disabled
// import GameLoadingOverlay from "@features/auth/components/GameLoadingOverlay"; // loading disabled
// import SoundToggle from "@components/common/SoundToggle";
import { useSound } from "@hooks/useSound";
import { useTimer } from "@hooks/useTimer";
import useGameSessionGuard from "@hooks/useGameSessionGuard";
import useDigitBets from "@hooks/useDigitBets";
import useGameKeyboard, { CHIP_VALUES } from "@hooks/useGameKeyboard";
import { recordService } from "@services/record.service";
import {
  savePendingBet,
  loadPendingBet,
  clearPendingBet,
} from "@utils/pendingBet";
import { istSeconds, istDateStr, ist12hStr, ist24hStr } from "@utils/istTime";

const DEBUG = false;

const HomePage = () => {
  const { user, logout, refreshBalance, setAuth } = useAuth();
  const navigate = useNavigate();
  const { play, playBgm, stop } = useSound();

  // Auto-logout when app becomes hidden (tab switch, minimize, Home, background).
  useGameSessionGuard(logout, navigate);
  const [spinCount, setSpinCount] = useState(0);
  const [spinStartMs, setSpinStartMs] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [lastWinner, setLastWinner] = useState(null);
  const [lastJoker, setLastJoker] = useState(null);
  const [resultError, setResultError] = useState(false);
  const [selectedValue, setSelectedValue] = useState(1);
  const [bets, setBets] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [resultRevealed, setResultRevealed] = useState(false);
  const [taken, setTaken] = useState(false);
  const [won, setWon] = useState(false);
  const [gameMessage, setGameMessage] = useState(
    "Please Bet to Start Game. Minimum Bet=1",
  );
  const [winInfo, setWinInfo] = useState(null);
  // Bumped when the wheel stops so LastWinningData reloads right away.
  const [lastWinsRefresh, setLastWinsRefresh] = useState(0);
  // Cancel Specific works once per betting session, then disables until a
  // new bet is placed.
  const [cancelSpecificUsed, setCancelSpecificUsed] = useState(false);
  const [fetching, setFetching] = useState(false);
  // True once the backend balance already includes the placed bet amount.
  // Keeps the score flat across Bet Ok (no 990 -> 1000 -> 990 jump).
  const [betApplied, setBetApplied] = useState(true);
  // Single source of truth for the displayed score. Updated EXPLICITLY (not
  // derived) so the backend balance refresh and the local bet deduction can
  // never double-dip — that transient caused a 990 -> 980 -> 990 flash with
  // a sound on Bet Ok / auto-submit.
  const [scoreBalance, setScoreBalance] = useState(() => user?.balance ?? 0);
  const manualMsg = useRef(false);
  const autoSubmitted = useRef(false);
  const noBetRounds = useRef(0);
  // Placement order for cancel-specific (last come first out).
  const betOrder = useRef([]);
  // Refs to keep handleBet / handleButtonAction references stable so
  // child components wrapped in React.memo don't re-render on every tick.
  const selectedRef = useRef(selectedValue);
  selectedRef.current = selectedValue;
  const betsRef = useRef(bets);
  betsRef.current = bets;
  const submittedRef = useRef(submitted);
  submittedRef.current = submitted;
  const resultRevealedRef = useRef(resultRevealed);
  resultRevealedRef.current = resultRevealed;
  const takePendingRef = useRef(false);
  const totalBetRef = useRef(0);
  const userRef = useRef(user);
  userRef.current = user;

  const totalBet = Object.values(bets).reduce((sum, v) => sum + v, 0);
  totalBetRef.current = totalBet;

  // True while the post-Take score roll-up is driving the display, so the
  // backend-balance sync effect doesn't jump the score to its final value.
  const scoreRollGuardRef = useRef(false);

  // Sync the score to the authoritative backend balance whenever no local
  // (unapplied) bet deduction is on screen.
  useEffect(() => {
    if (!betApplied || scoreRollGuardRef.current) return;
    setScoreBalance(user?.balance ?? 0);
  }, [betApplied, user?.balance]);

  // Persist the current round's bet to disk so an interrupted session can be
  // restored after the user closes the app. Saved whenever the ticket changes;
  // never cleared here — clearing happens only on Take / round reset, and any
  // stale snapshot is ignored on restore by the drawTime gate below.
  const username = user?.username || "";
  useEffect(() => {
    if (submitted && totalBet > 0) {
      savePendingBet(username, {
        bets,
        betOrder: betOrder.current,
        submitted,
        drawTime: ist12hStr(1),
        amt: totalBet,
      });
    }
  }, [bets, submitted, totalBet, username]);

  // Restore an interrupted session every time the Home screen mounts (fresh
  // load or return from the Pre lobby):
  //   - Pending (untaken) win  -> show the bet + total AND the Take option.
  //   - Accepted bet for the CURRENT draw -> show the bet, settle normally.
  //   - Numbers chosen but not accepted -> put them back, user can accept.
  //   - Nothing / past draw with no win -> clean state, user can bet again.
  useEffect(() => {
    if (!username) return;
    let mounted = true;

    const restore = async () => {
      const snap = loadPendingBet(username);
      const sameDraw = snap?.drawTime === ist12hStr(1) && snap?.amt > 0;

      // Case 1: Returning to the CURRENT ongoing draw before it has resolved.
      // Do NOT check or reveal winAmount yet — wait for the wheel spin at :00!
      if (sameDraw) {
        if (!mounted) return;
        setBets(snap.bets);
        betOrder.current = [...(snap.betOrder || [])];
        setCancelSpecificUsed(false);
        if (snap.submitted) {
          // Accepted before exit — keep the score flat and settle this round normally.
          setSubmitted(true);
          setBetApplied(true);
          manualMsg.current = true;
          setGameMessage("Your Bet has been Accepted. Waiting for Result.");
        } else {
          // Numbers chosen but never accepted — restore them so the user can accept or cancel.
          setSubmitted(false);
          setBetApplied(false);
          const restoredTotal = Object.values(snap.bets).reduce(
            (s, v) => s + v,
            0,
          );
          setScoreBalance(Math.max(0, (user?.balance || 0) - restoredTotal));
        }
        return;
      }

      // Case 2: Draw already completed while the user was away in PreScreen.
      // Check if there are uncollected winnings from the completed draw.
      let pendingWin = null;
      try {
        const { data } = await recordService.winAmount({ username });
        const amount = Number(data?.data?.win_amount || 0);
        if (amount > 0) pendingWin = data?.data || null;
      } catch {
        pendingWin = null;
      }

      if (!mounted) return;

      if (pendingWin) {
        setWinInfo(pendingWin);
        setWon(true);
        setResultRevealed(true);
        setSubmitted(true);
        if (snap) {
          setBets(snap.bets);
          betOrder.current = [...(snap.betOrder || [])];
          setCancelSpecificUsed(false);
          setBetApplied(true);
        }
        manualMsg.current = true;
        setGameMessage(
          "Congratulations!!! You Win. Please Take the Winning Points.",
        );
      }
    };

    restore();
    return () => {
      mounted = false;
    };
  }, [username]);

  // ── Take / round state ──────────────────────────────────────────
  // Take appears only when there is a WINNING result on the board.
  const takePending = resultRevealed && !taken && won;
  takePendingRef.current = takePending;

  // ── Minute boundary handler ─────────────────────────────────────
  // Fired by useTimer exactly once per IST minute crossing.
  const handleNewMinute = useCallback(async () => {
    // If a winning take is pending (user hasn't claimed yet), freeze
    // everything at :00 — no new spin, no sound, timer stops at 0.
    if (takePendingRef.current) return;
    if (totalBet > 0) {
      noBetRounds.current = 0;
    } else {
      noBetRounds.current += 1;
      if (noBetRounds.current >= 3) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
    }
    // Defer balance check slightly so it doesn't trigger a full-tree re-render at the exact spin-start frame
    setTimeout(() => refreshBalance(), 1000);
    setLastWinner(null);
    setLastJoker(null);
    setResultRevealed(false);
    setTaken(false);
    setSpinStartMs(performance.now());
    setWheelSpinning(true);
    setSpinCount((c) => c + 1);

    try {
      const { data } = await resultService.getCurrentResult();
      const r = data?.result?.[0];
      if (!r) throw new Error("no result");
      setLastWinner(Number(r.result) % 10);
      setLastJoker(Number(r.joker) || null);
      setResultError(false);
    } catch {
      setResultError(true);
      setLastWinner((prev) => (prev != null ? prev : 0));
    }
  }, [refreshBalance, totalBet, logout, navigate]);

  // ── Server-calibrated IST countdown ─────────────────────────────
  // useTimer fires handleNewMinute exactly once per :00 boundary.
  // Drift-corrected, background-tab-safe, Luxon-backed.
  const rawTime = useTimer({ onMinuteStart: handleNewMinute });

  // ── Freeze at :00 when take is pending ───────────────────────────
  // Once the timer hits 0 and the user hasn't taken yet, freeze
  // EVERYTHING (timer, sound, wheel) until the Take is claimed.
  // A ref is used because rawTime keeps ticking past 0 → 59, and we
  // need the frozen state to persist across those ticks.
  const frozenRef = useRef(false);
  if (takePending && rawTime === 0) frozenRef.current = true;
  if (!takePending) frozenRef.current = false;
  const timerFrozen = frozenRef.current;
  const time = timerFrozen ? 0 : rawTime;

  // Betting lock: last 10 seconds of the minute + while the wheel is spinning.
  const clickLocked = wheelSpinning || timerFrozen || (time <= 10 && time > 0);

  // No affordable balance (0 balance, or the pending bet already eats the
  // whole balance): block placing new bets and disable the bet controls.
  const noBalance = (user?.balance ?? 0) - totalBet <= 0;

  // Timer countdown sound loops continuously. Mutes while the wheel
  // is spinning OR while the timer is frozen on a pending take.
  useEffect(() => {
    if (wheelSpinning || timerFrozen) {
      stop("TICK");
      return;
    }
    play("TICK", { loop: true });
    return () => stop("TICK");
  }, [wheelSpinning, timerFrozen, play, stop]);

  const handlePanelSelect = useCallback((value) => {
    setSelectedValue(value);
  }, []);

  // Bet-submission lock: true the moment a Bet OK / auto-submit API call
  // starts.  Prevents handleBet from adding new numbers while the backend
  // is still processing the previous submission.
  const placingRef = useRef(false);

  const handleBet = useCallback((num) => {
    if (placingRef.current) return;
    const sv = selectedRef.current;
    const tp = takePendingRef.current;
    const tr = totalBetRef.current;
    const ur = userRef.current;
    if (sv === null) return;
    // Once a bet is accepted, no further bets until the result arrives.
    if (submittedRef.current && !resultRevealedRef.current) {
      manualMsg.current = true;
      setGameMessage("Bet already accepted. Wait for the result.");
      return;
    }
    // If a winning bet is pending, must take before placing new bets.
    if (tp) {
      manualMsg.current = true;
      setGameMessage("Take your winning first");
      return;
    }
    // Balance validation
    const balance = ur?.balance ?? 0;
    if (balance <= 0) {
      manualMsg.current = true;
      setGameMessage("Score Insufficient. Please recharge your balance.");
      return;
    }
    if (tr + sv > balance) {
      manualMsg.current = true;
      setGameMessage("Score Insufficient.");
      return;
    }
    // Limit per number: Maximum 5000 allowed on a single number
    const currentNumBet = betsRef.current?.[num] || 0;
    if (currentNumBet + sv > 5000) {
      manualMsg.current = true;
      setGameMessage("Max Bet 5000 per number limit reached.");
      return;
    }
    // A new bet for the next result stops the winner blink and starts
    // a fresh round.
    if (resultRevealedRef.current) {
      setBets({});
      betOrder.current = [];
      setResultRevealed(false);
      setSubmitted(false);
      setWinInfo(null);
    }
    // A new bet re-arms Cancel Specific for one more use.
    setCancelSpecificUsed(false);
    betOrder.current.push({ num, amt: sv });
    setBets((prev) => ({ ...prev, [num]: (prev[num] || 0) + sv }));
    const nextTotal = resultRevealedRef.current ? sv : tr + sv;
    setScoreBalance(Math.max(0, (ur?.balance || 0) - nextTotal));
    setBetApplied(false);
    manualMsg.current = true;
    setGameMessage("You can either make Bet or Press BETOK Button.");
  }, []);

  // Keyboard/remote digit shortcuts: pressing "0"-"9" places a bet straight
  // onto that board number. Same lock gate as tapping the numbers.
  const numbersLockedRef = useRef(false);
  numbersLockedRef.current =
    clickLocked ||
    noBalance ||
    takePending ||
    fetching ||
    (submitted && !resultRevealed);

  const handleDigitBet = useCallback(
    (num) => {
      if (numbersLockedRef.current) return;
      const sv = selectedRef.current;
      if (sv === null) {
        manualMsg.current = true;
        setGameMessage("Select a number first");
        return;
      }
      play("BET");
      handleBet(num);
    },
    [play, handleBet],
  );

  useDigitBets(handleDigitBet);

  const clearBets = useCallback(() => {
    setBets({});
    betOrder.current = [];
    setCancelSpecificUsed(false);
    setBetApplied(true);
    setScoreBalance(user?.balance ?? 0);
    clearPendingBet(user?.username || "");
  }, [user?.balance, user?.username]);

  // Place the bet via the backend. Ticket = "num-amount" pairs.
  const handlePlaceBet = useCallback(async () => {
    if (placingRef.current) return;
    placingRef.current = true;
    setFetching(true);
    try {
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
      if (totalBet < 1) {
        manualMsg.current = true;
        setGameMessage("Minimum bet amount is 1.");
        return;
      }

      // Balance validation: bet amount cannot exceed balance.
      const balance = user?.balance ?? 0;
      if (totalBet > balance) {
        manualMsg.current = true;
        setGameMessage("Score Insufficient.");
        return;
      }

      const payload = {
        currentDate: istDateStr(),
        drawTime: ist12hStr(1), // "03:26 PM" (12h, no seconds)
        nextdrawTime: ist24hStr(1), // "15:26" (24h, no seconds)
        ticket,
        qty: totalBet,
        totalAmount: totalBet,
        username: user?.username || "",
      };

      const { data } = await recordService.insertRecord(payload);
      if (data?.success) {
        manualMsg.current = true;
        setGameMessage("Your Bet has been Accepted");
        setSubmitted(true);
        const bal = Number(data?.balance);
        if (Number.isFinite(bal)) {
          const u = userRef.current;
          if (u) setAuth({ ...u, balance: bal });
        }
        setBetApplied(true);
      } else {
        manualMsg.current = true;
        setGameMessage(data?.message || "Bet failed");
      }
    } catch {
      manualMsg.current = true;
      setGameMessage("Bet failed. Try again.");
    } finally {
      placingRef.current = false;
      setFetching(false);
    }
  }, [bets, totalBet, user]);

  // Auto-OK: when the countdown hits the last 10 seconds, submit any
  // pending bets automatically. Runs once per round.
  useEffect(() => {
    if (time > 10) {
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
  //   betting window   -> "Please Bet to Start Game. Minimum Bet=1"
  // Manual messages (validation / accepted) override the betting-window prompt.
  // While a winning Take is pending, the win banner stays on screen (the
  // "Please Take the Winning Points." reminder is set at the :00 boundary).
  useEffect(() => {
    if (takePending) return;
    if (time <= 10 && time > 0) {
      manualMsg.current = false;
      setGameMessage("Bet Time Over.");
    } else if (wheelSpinning) {
      manualMsg.current = false;
      setGameMessage("FOR AMUSEMENT ONLY NO CASH VALUE");
    } else if (!manualMsg.current && time > 12) {
      setGameMessage("Please Bet to Start Game. Minimum Bet=1");
    }
  }, [time, wheelSpinning, takePending]);

  const handleButtonAction = useCallback(
    async (id) => {
      if (clickLocked && id !== "exit" && id !== "takeBet") return;
      // While a winning Take is pending, only Take works (Exit always works).
      if (takePending && id !== "takeBet" && id !== "exit") return;
      // Once a bet is accepted, nothing works until the result arrives
      // (Exit always works).
      if (submitted && !resultRevealed && id !== "exit") return;
      // Exit always works — handle immediately, no fetch lock needed.
      if (id === "exit") {
        navigate("/pre", { replace: true });
        return;
      }
      // From here on every path is either sync or async — lock buttons
      // instantly so the user cannot double-click while the API call runs.
      setFetching(true);
      try {
        // Cancel All clears every placed bet.
        // Once the bet is accepted, bets can no longer be cancelled.
        if (submitted && (id === "cancelAll" || id === "cancelSpecific")) {
          manualMsg.current = true;
          setGameMessage("Bet already accepted. Cannot cancel.");
          return;
        }
        if (id === "cancelAll") {
          clearBets();
        }
        // Cancel Specific removes the ENTIRE bet of the MOST RECENTLY placed
        // number (last come first out) — every unit on that number, e.g. 2x10
        // on a number clears the full 20. It works ONE time per betting
        // session — after the click the button disables until a new bet is
        // placed.
        if (id === "cancelSpecific") {
          // If the order tracker is empty but bets are on screen (e.g. after
          // a round reset), rebuild it from the current bets so cancel keeps
          // working.
          if (betOrder.current.length === 0) {
            betOrder.current = Object.entries(bets).map(([num, amt]) => ({
              num: Number(num),
              amt,
            }));
          }
          const last = betOrder.current[betOrder.current.length - 1];
          if (last) {
            const num = last.num;
            // The whole bet placed on that number returns to the score
            // (e.g. 2x10 on one number clears 20 and gives 20 back).
            const cancelledAmt = bets[num] || last.amt;
            // Drop every recorded placement of that number and clear its
            // whole bet.
            betOrder.current = betOrder.current.filter((e) => e.num !== num);
            setBets((prev) => {
              const next = { ...prev };
              delete next[num];
              return next;
            });
            // The deducted amount goes straight back to the balance.
            setScoreBalance((prev) => prev + cancelledAmt);
            if (betOrder.current.length === 0) {
              clearPendingBet(user?.username || "");
            }
          }
          setCancelSpecificUsed(true);
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
              const loadedTotal = Object.values(parsed).reduce(
                (s, v) => s + v,
                0,
              );
              const balance = user?.balance ?? 0;
              if (loadedTotal > balance) {
                manualMsg.current = true;
                setGameMessage("Score Insufficient.");
                return;
              }
              setBets(parsed);
              betOrder.current = Object.entries(parsed).map(([n, amt]) => ({
                num: Number(n),
                amt,
              }));
              setCancelSpecificUsed(false);
              setSubmitted(false);
              setResultRevealed(false);
              // The loaded ticket is not yet submitted/deducted: show the
              // deduction on the score directly.
              setBetApplied(false);
              setScoreBalance(Math.max(0, (user?.balance || 0) - loadedTotal));
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
        // take: claim winnings — backend is source of truth for balance.
        if (id === "takeBet") {
          if (!takePending) return;
          const info = winInfo;
          if (!info?.barcode) {
            manualMsg.current = true;
            setGameMessage("Could not claim winnings. Try again.");
            return;
          }
          play("TAKE");
          setTaken(true);
          setResultRevealed(false);
          setWon(false);
          setSubmitted(false);
          setWinInfo(null);
          setCancelSpecificUsed(false);
          clearBets();
          manualMsg.current = false;
          setGameMessage("Take successful.");
          // Start score roll-up immediately (same frame as winner countdown)
          // rather than waiting for the API response.  Both animations use
          // the same animated-number hook config so they finish together.
          const preBalance = Number(userRef.current?.balance ?? 0);
          const winAmt = Math.max(0, Number(info?.win_amount || 0));
          if (winAmt > 0) {
            scoreRollGuardRef.current = true;
            setScoreBalance(preBalance);
            requestAnimationFrame(() =>
              requestAnimationFrame(() =>
                setScoreBalance(preBalance + winAmt),
              ),
            );
            setTimeout(() => {
              scoreRollGuardRef.current = false;
            }, 1700);
          }
          recordService
            .take({
              username: user?.username || "",
              win_amount: info.win_amount,
              barcode: info.barcode,
              id: info.id,
            })
            .then(({ data }) => {
              if (data?.success === false) {
                manualMsg.current = true;
                setGameMessage(data?.message || "Take failed. Try again.");
                return;
              }
              // Just update auth balance from server — score animation is
              // already running above.
              const bal = Number(data?.balance);
              if (Number.isFinite(bal)) {
                const u = userRef.current;
                if (u) setAuth({ ...u, balance: bal });
              }
            })
            .catch(() => {
              manualMsg.current = true;
              setGameMessage("Take failed. Try again.");
            });
        }
      } finally {
        setFetching(false);
      }
    },
    [
      clearBets,
      handlePlaceBet,
      bets,
      totalBet,
      logout,
      navigate,
      clickLocked,
      refreshBalance,
      takePending,
      submitted,
      winInfo,
      play,
    ],
  );

  // Physical Keyboard shortcuts:
  // - Tab: Switch chip denomination (1 -> 5 -> 10 -> 50 -> 100 -> 500 -> 1000 -> 5000 -> 1)
  // - Enter: Bet OK (places bet, or loads previous bet if 0 bets)
  // - Space: Take (claims winning points if win pending)
  // - Esc: Back / Exit to lobby (/pre)
  const handleTabSwitch = useCallback(
    (isShift) => {
      const current = selectedRef.current;
      const currentIndex = CHIP_VALUES.indexOf(current);
      let nextIndex;
      if (isShift) {
        nextIndex =
          currentIndex <= 0 ? CHIP_VALUES.length - 1 : currentIndex - 1;
      } else {
        nextIndex =
          currentIndex < 0 || currentIndex >= CHIP_VALUES.length - 1
            ? 0
            : currentIndex + 1;
      }
      const nextValue = CHIP_VALUES[nextIndex];
      setSelectedValue(nextValue);
      play("CLICK");
    },
    [play],
  );

  const handleBetOkKey = useCallback(() => {
    play("CLICK");
    handleButtonAction("preview");
  }, [play, handleButtonAction]);

  const handleTakeKey = useCallback(() => {
    handleButtonAction("takeBet");
  }, [handleButtonAction]);

  const handleBackKey = useCallback(() => {
    play("CLICK");
    handleButtonAction("exit");
  }, [play, handleButtonAction]);

  useGameKeyboard({
    onTabSwitch: handleTabSwitch,
    onBetOk: handleBetOkKey,
    onTake: handleTakeKey,
    onBack: handleBackKey,
  });

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

  const handleSpinComplete = useCallback(
    async (winner) => {
      setLastWinner(winner);
      setWheelSpinning(false);
      setResultRevealed(true);
      // Reload the last 10 wins as soon as the wheel stops.
      setLastWinsRefresh((c) => c + 1);
      // Won only if a bet was placed on the winning number.
      const didWin = Number(bets[winner] || 0) > 0;
      setWon(didWin);
      setTaken(false);
      // Win/lose sound the moment the wheel stops (only when a bet was placed).
      if (totalBet > 0) {
        play(didWin ? "WIN" : "LOSE");
      }
      // Winning amount only shows when a bet was placed this round.
      if (totalBet <= 0) return;
      // Show the win banner right away; it stays on screen while the Take is
      // pending (until claimed or the :00 reminder replaces it).
      if (didWin) {
        manualMsg.current = true;
        setGameMessage("Congratulations!!! You Win.");
      }
      try {
        const { data } = await recordService.winAmount({
          username: user?.username || "",
        });
        const amount = Number(data?.data?.win_amount || 0);
        manualMsg.current = true;
        if (amount > 0) {
          setWinInfo(data?.data || null);
        } else {
          // No win this draw -> clear the placed bets automatically.
          setWinInfo(null);
          setWon(false);
          setBets({});
          betOrder.current = [];
          setCancelSpecificUsed(false);
          setSubmitted(false);
          setBetApplied(true);
          clearPendingBet(user?.username || "");
          setGameMessage("Game over. Press PreBetOK Button or Make Bet.");
        }
      } catch {
        setWinInfo(null);
        manualMsg.current = true;
        setGameMessage("Failed to load winning amount");
      }
    },
    [bets, totalBet, user, play],
  );

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

      {/* Score is a single managed state: the pending-bet deduction is shown
          the moment a number is clicked and stays flat across Bet Ok. */}
      <ScoreDisplay score={Math.max(0, scoreBalance)} />
      <TotalBetDisplay total={totalBet} />
      <WinnerDisplay winner={lastWinner} winAmount={winInfo?.win_amount} />
      <TimerDisplay time={time} />
      <WheelDisplay
        spinTrigger={spinCount}
        spinStartMs={spinStartMs}
        targetWinner={lastWinner}
        joker={lastJoker}
        onComplete={handleSpinComplete}
      />
      <GifDisplay />
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
      <LastWinningData refreshTrigger={lastWinsRefresh} />
      <NumberDisplay
        bets={bets}
        onBet={handleBet}
        disabled={
          clickLocked ||
          noBalance ||
          takePending ||
          fetching ||
          (submitted && !resultRevealed)
        }
        winnerBlink={resultRevealed && !taken ? lastWinner : null}
      />
      <PanelDisplay
        selectedValue={selectedValue}
        onSelect={handlePanelSelect}
        disabled={
          clickLocked ||
          noBalance ||
          takePending ||
          fetching ||
          (submitted && !resultRevealed)
        }
      />
      <ButtonDisplay
        onAction={handleButtonAction}
        hasBets={totalBet > 0}
        disabled={clickLocked || fetching || (submitted && !resultRevealed)}
        takeGlow={takePending}
        takeLock={takePending}
        submitted={submitted}
        resultRevealed={resultRevealed}
        cancelSpecificLocked={cancelSpecificUsed}
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
