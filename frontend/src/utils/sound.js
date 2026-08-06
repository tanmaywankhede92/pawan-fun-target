import { SOUNDS, SOUND_MUTED_KEY } from '@constants/sounds';

const files = import.meta.glob(
  '../assets/sounds/*.{mp3,wav,ogg,MP3,WAV,OGG}',
  { eager: true },
);

const getSrc = (name) => {
  const base = SOUNDS[name];
  if (!base) return null;
  const target = `${base.toLowerCase()}.`;
  const key = Object.keys(files).find((k) => {
    const file = k.split('/').pop().toLowerCase();
    return file.startsWith(target);
  });
  return key ? files[key].default : null;
};

let muted = false;
let bgm = null;
let bgmSrc = null;
const cache = new Map();

try {
  muted = localStorage.getItem(SOUND_MUTED_KEY) === '1';
} catch {
  muted = false;
}

export const isSoundMuted = () => muted;

export const setSoundMuted = (value) => {
  muted = value;
  try {
    localStorage.setItem(SOUND_MUTED_KEY, value ? '1' : '0');
  } catch {
    // storage unavailable
  }
  if (bgm) bgm.muted = value;
};

export const toggleSoundMuted = () => {
  setSoundMuted(!muted);
  return muted;
};

export const playSound = (name) => {
  if (muted) return;
  const src = getSrc(name);
  if (!src) return;
  const audio = cache.get(name) || new Audio(src);
  cache.set(name, audio);
  audio.currentTime = 0;
  audio.volume = 1;
  audio.play().catch(() => {});
};

export const stopSound = (name) => {
  const audio = cache.get(name);
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
};

export const playMusic = (name = 'BGM') => {
  if (muted) return;
  const src = getSrc(name);
  if (!src) return;
  const url = new Audio(src).src;
  if (bgm && bgmSrc === url) {
    if (bgm.paused) bgm.play().catch(() => {});
    return;
  }
  stopMusic();
  bgmSrc = url;
  bgm = new Audio(url);
  bgm.loop = true;
  bgm.volume = 0.4;
  bgm.play().catch(() => {});
};

export const stopMusic = () => {
  if (bgm) {
    bgm.pause();
    bgm = null;
  }
  bgmSrc = null;
};
