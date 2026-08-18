import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@hooks/useAuth";
import GameBackground from "../components/GameBackground";
import LoginOverlay from "../components/LoginOverlay";
import UsernameInput from "../components/UsernameInput";
import { usernamePos } from "../components/UsernameInput";
import PasswordInput from "../components/Password";
import { passwordPos } from "../components/Password";
import EnterButton from "../components/EnterButton";
import { enterPos } from "../components/EnterButton";
import CloseButton from "../components/CloseButton";
import { closePos } from "../components/CloseButton";
import ApiResponseBox from "../components/ApiResponseBox";
import { useSound } from "@hooks/useSound";
import { closeApplication } from "@utils/closeApplication";
import { deviceUuid } from "@utils/deviceUuid";
import prevImg from "@assets/images/background/prevImg.webp";

const DEBUG = false;

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { play } = useSound();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(t);
  }, []);

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
    <LoginOverlay>
      <GameBackground />

      <UsernameInput
        value={username}
        onChange={setUsername}
        onKeyDown={handleKeyDown}
      />
      <PasswordInput
        value={password}
        onChange={setPassword}
        onKeyDown={handleKeyDown}
      />
      <EnterButton onClick={handleEnter} loading={loading} />
      <CloseButton onClick={handleClose} />

      <ApiResponseBox />

      {!ready && (
        <div
          className="fixed inset-0 z-[200] overflow-hidden bg-black"
          style={{ transition: "opacity 0.3s ease" }}
        >
          <img
            decoding="async"
            src={prevImg}
            alt="Fun Target"
            className="h-full w-full object-fill"
          />
        </div>
      )}
    </LoginOverlay>
  );
};

export default LoginPage;
  