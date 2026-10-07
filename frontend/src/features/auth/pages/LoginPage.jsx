import { useState, useCallback } from "react";
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

const isTvDevice = () => {
  try {
    if (window.Android && typeof window.Android.isAndroidTV === "function") {
      return Boolean(window.Android.isAndroidTV());
    }
  } catch {}
  const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
  const isDesktop =
    /Windows NT|Macintosh|Mac OS X/i.test(ua) ||
    (/Linux/i.test(ua) && !/Android/i.test(ua));
  if (isDesktop) return false;
  const isMobilePhone = /Mobile|iPhone|iPod|Android.*Mobile/i.test(ua);
  if (isMobilePhone) return false;
  return Boolean(
    /Android/i.test(ua) &&
    (/TV|GoogleTV|AndroidTV|SmartTV|BRAVIA|AFT|MiTV|NetCast|Tizen|WebOS/i.test(ua) ||
      !/Mobile/i.test(ua))
  );
};

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isShifted, setIsShifted] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { play } = useSound();
  const isTv = isTvDevice();

  const handleInputFocus = useCallback(() => {
    if (isTv) setIsShifted(true);
  }, [isTv]);

  const handleInputBlur = useCallback(() => {
    if (isTv) {
      setTimeout(() => {
        const active = document.activeElement;
        if (!active || active.tagName !== "INPUT") {
          setIsShifted(false);
        }
      }, 150);
    }
  }, [isTv]);

  const handleEnter = useCallback(async () => {
    if (!username.trim() || !password) return;
    if (loading) return;
    play("CLICK");
    setLoading(true);
    try {
      const result = await login({ username: username.trim(), password, device_uuid: deviceUuid });
      navigate(result.redirect || "/pre", { replace: true });
    } catch (err) {
      toast.error(err?.message || "Invalid username or password");
      setPassword("");
    } finally {
      setLoading(false);
    }
  }, [username, password, loading, login, navigate, play]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleEnter();
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
    <LoginOverlay isShifted={isShifted}>
      <GameBackground />

      <UsernameInput
        value={username}
        onChange={setUsername}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      <PasswordInput
        value={password}
        onChange={setPassword}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      <EnterButton onClick={handleEnter} loading={loading} />
      <CloseButton onClick={handleClose} />

      <ApiResponseBox />
    </LoginOverlay>
  );
};

export default LoginPage;
  