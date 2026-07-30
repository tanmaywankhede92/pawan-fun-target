import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import GameBackground from '../components/GameBackground';
import LoginOverlay from '../components/LoginOverlay';
import UsernameInput from '../components/UsernameInput';
import { usernamePos } from '../components/UsernameInput';
import PasswordInput from '../components/PasswordInput';
import { passwordPos } from '../components/PasswordInput';
import EnterButton from '../components/EnterButton';
import { enterPos } from '../components/EnterButton';
import CloseButton from '../components/CloseButton';
import { closePos } from '../components/CloseButton';

const DEBUG = false; // Set to true to show colored rectangles over interactive areas

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEnter = useCallback(async () => {
    if (!username.trim() || !password) return;
    if (loading) return;
    setLoading(true);
    try {
      const result = await login({ username: username.trim(), password });
      navigate(result.redirect || '/', { replace: true });
    } catch {
      setPassword('');
    } finally {
      setLoading(false);
    }
  }, [username, password, loading, login, navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleEnter();
  }, [handleEnter]);

  const handleClose = useCallback(() => {
    if (window.close) {
      window.close();
    } else {
      const confirmed = window.confirm('Exit Fun Target?');
      if (confirmed) window.location.href = 'about:blank';
    }
  }, []);

  return (
    <LoginOverlay>
      <GameBackground />

      <UsernameInput value={username} onChange={setUsername} onKeyDown={handleKeyDown} />
      <PasswordInput value={password} onChange={setPassword} onKeyDown={handleKeyDown} />
      <EnterButton onClick={handleEnter} />
      <CloseButton onClick={handleClose} />

      {/* Debug overlays — set DEBUG=true above to see element positions */}
      {DEBUG && (
        <>
          <div className="absolute border-2 border-red-500 bg-red-500/20 pointer-events-none" style={usernamePos}>
            <span className="text-red-300 text-xs">Account</span>
          </div>
          <div className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none" style={passwordPos}>
            <span className="text-blue-300 text-xs">Password</span>
          </div>
          <div className="absolute border-2 border-green-500 bg-green-500/20 pointer-events-none flex items-center justify-center" style={enterPos}>
            <span className="text-green-300 text-xs">ENTER</span>
          </div>
          <div className="absolute border-2 border-yellow-500 bg-yellow-500/20 pointer-events-none flex items-center justify-center" style={closePos}>
            <span className="text-yellow-300 text-xs">X</span>
          </div>
        </>
      )}
    </LoginOverlay>
  );
};

export default LoginPage;
