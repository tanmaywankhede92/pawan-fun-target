import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@hooks/useAuth";
import GameBackground from "../components/GameBackground";
import LoginOverlay from "../components/LoginOverlay";
import UsernameInput from "../components/UsernameInput";
import PasswordInput from "../components/Password";
import EnterButton from "../components/EnterButton";
import CloseButton from "../components/CloseButton";
import ApiResponseBox from "../components/ApiResponseBox";
import { useSound } from "@hooks/useSound";
import { closeApplication } from "@utils/closeApplication";
import { deviceUuid } from "@utils/deviceUuid";
import { isMobile } from "@utils/isTv";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const blurTimerRef = useRef(null);
  const isPhone = isMobile();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { play } = useSound();

  const handleFocus = useCallback(() => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    setInputFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
    }
    // Delay resetting focus so tapping the Enter button on mobile
    // touchscreens isn't canceled or mis-aimed by an immediate CSS shift animation
    blurTimerRef.current = setTimeout(() => {
      setInputFocused(false);
      blurTimerRef.current = null;
    }, 250);
  }, []);

  const handleEnter = useCallback(async () => {
    const trimmedUser = username.trim().toLowerCase().replace(/^gk/i, "");
    if (!trimmedUser || !password) return;
    if (loading) return;
    play("CLICK");
    setLoading(true);
    try {
      const result = await login({
        username: trimmedUser,
        password,
        deviceUuid: deviceUuid,
        device_uuid: deviceUuid,
      });
      navigate(result.redirect || "/pre", { replace: true });
    } catch (err) {
      const errMsg = err?.message || "Invalid username or password";

      // If user is already logged in on another device, warn and do NOT bypass/enter
      if (typeof errMsg === "string" && errMsg.toLowerCase().includes("already logged in")) {
        toast.warn(errMsg || "User is already logged in on another device!");
      } else {
        toast.error(errMsg);
      }
      setPassword("");
    } finally {
      setLoading(false);
    }
  }, [username, password, loading, login, navigate, play]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.keyCode === 13 || e.which === 13) {
        handleEnter();
      }
    },
    [handleEnter],
  );

  const handleClose = useCallback(() => {
    play("CLICK");
    // Exit the application. closeApplication() picks the mechanism suited to
    // the runtime (native wrapper, WebView bridge, or script-opened window).
    closeApplication();
  }, [play]);

  return (
    <LoginOverlay isShifted={isPhone && inputFocused}>
      <GameBackground />

      <UsernameInput
        value={username}
        onChange={(val) => setUsername((val || "").toLowerCase())}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <PasswordInput
        value={password}
        onChange={setPassword}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <EnterButton onClick={handleEnter} loading={loading} />
      <CloseButton onClick={handleClose} />

      <ApiResponseBox />
    </LoginOverlay>
  );
};

export default LoginPage;
  