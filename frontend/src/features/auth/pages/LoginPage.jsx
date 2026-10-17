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

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { play } = useSound();

  const handleEnter = useCallback(async () => {
    const trimmedUser = username.trim().toLowerCase();
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
        onChange={(val) => setUsername((val || "").toLowerCase())}
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
    </LoginOverlay>
  );
};

export default LoginPage;
  