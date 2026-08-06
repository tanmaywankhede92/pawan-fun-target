import { useCallback, useState } from 'react';
import {
  isSoundMuted,
  playMusic,
  playSound,
  setSoundMuted,
  stopMusic,
  stopSound,
} from '@utils/sound';

export const useSound = () => {
  const [muted, setMuted] = useState(isSoundMuted());

  const play = useCallback((name) => playSound(name), []);
  const stop = useCallback((name) => stopSound(name), []);
  const playBgm = useCallback((name) => playMusic(name), []);
  const stopBgm = useCallback(() => stopMusic(), []);
  const toggleMute = useCallback(() => {
    setMuted(setSoundMuted(!isSoundMuted()));
  }, []);

  return { muted, play, stop, playBgm, stopBgm, toggleMute };
};
