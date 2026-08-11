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
try {
  muted = localStorage.getItem(SOUND_MUTED_KEY) === '1';
} catch {
  muted = false;
}

// ---------------------------------------------------------------------------
// Web Audio pipeline.
// Every sound is fetched + decoded ONCE at boot (async, off the main thread)
// so the first play is instant and never blocks the UI with WAV decoding.
// Until the user gestures, the context stays suspended; sounds are queued and
// flushed on the first interaction.
// ---------------------------------------------------------------------------
let ctx = null;
let unlocked = false;
const buffers = new Map(); // name -> AudioBuffer
const sfxElements = new Map(); // name -> HTMLAudioElement (fallback)
const pendingSounds = new Set(); // names queued until audio unlocks
const activeSources = new Map(); // name -> AudioBufferSourceNode (SFX)
let bgmElement = null;
let bgmSrc = null;

const getCtx = () => {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  return ctx;
};

const decodeOne = (name, src) => {
  const ac = getCtx();
  if (!ac) return;
  fetch(src)
    .then((res) => res.arrayBuffer())
    .then((data) => {
      ac.decodeAudioData(
        data,
        (buf) => {
          buffers.set(name, buf);
          if (unlocked && pendingSounds.has(name)) {
            pendingSounds.delete(name);
            playBuffer(name);
          }
        },
        () => {},
      );
    })
    .catch(() => {});
};

// Warm the audio cache in the background while the app boots.
const preloadAll = () => {
  if (typeof window === 'undefined') return;
  if (!getCtx()) return; // no Web Audio support -> element fallback only
  for (const name of Object.keys(SOUNDS)) {
    const src = getSrc(name);
    if (src) decodeOne(name, src);
  }
};
preloadAll();

const playBuffer = (name) => {
  if (muted) return;
  const buf = buffers.get(name);
  const ac = getCtx();
  if (!buf || !ac) return;
  const prev = activeSources.get(name);
  if (prev) {
    try {
      prev.stop();
    } catch {
      // already ended
    }
    activeSources.delete(name);
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.connect(ac.destination);
  src.onended = () => activeSources.delete(name);
  src.start(0);
  activeSources.set(name, src);
};

const getSfxElement = (name, src) => {
  if (!sfxElements.has(name)) {
    const el = new Audio(src);
    el.preload = 'auto';
    sfxElements.set(name, el);
  }
  return sfxElements.get(name);
};

const elementPlay = (name) => {
  if (muted) return;
  const src = getSrc(name);
  if (!src) return;
  const el = getSfxElement(name, src);
  el.currentTime = 0;
  el.volume = 1;
  el.play().catch(() => {
    // Playback was blocked (autoplay policy) or data wasn't ready yet;
    // retry on the next gesture.
    pendingSounds.add(name);
  });
};

const unlock = () => {
  const ac = getCtx();
  if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
  unlocked = true;
  for (const name of [...pendingSounds]) {
    pendingSounds.delete(name);
    if (buffers.has(name)) playBuffer(name);
    else elementPlay(name);
  }
  // A BGM that was blocked on the first gesture can now resume.
  if (bgmElement && bgmElement.paused && !muted) {
    bgmElement.play().catch(() => {});
  }
};

['pointerdown', 'touchstart', 'keydown'].forEach((evt) =>
  window.addEventListener(evt, unlock, { capture: true, passive: true }),
);

export const isSoundMuted = () => muted;

export const setSoundMuted = (value) => {
  muted = value;
  try {
    localStorage.setItem(SOUND_MUTED_KEY, value ? '1' : '0');
  } catch {
    // storage unavailable
  }
  if (bgmElement) bgmElement.muted = value;
};

export const toggleSoundMuted = () => {
  setSoundMuted(!muted);
  return muted;
};

export const playSound = (name) => {
  if (muted) return;
  const src = getSrc(name);
  if (!src) return;
  if (unlocked && buffers.has(name)) {
    playBuffer(name);
    return;
  }
  if (unlocked) {
    elementPlay(name);
    return;
  }
  pendingSounds.add(name);
};

export const stopSound = (name) => {
  const src = activeSources.get(name);
  if (src) {
    try {
      src.stop();
    } catch {
      // already ended
    }
    activeSources.delete(name);
  }
  const el = sfxElements.get(name);
  if (el) {
    el.pause();
    el.currentTime = 0;
  }
};

export const playMusic = (name = 'BGM') => {
  if (muted) return;
  const src = getSrc(name);
  if (!src) return;
  const url = new Audio(src).src;
  if (bgmElement && bgmSrc === url) {
    if (bgmElement.paused) bgmElement.play().catch(() => {});
    return;
  }
  stopMusic();
  bgmSrc = url;
  bgmElement = new Audio(url);
  bgmElement.loop = true;
  bgmElement.volume = 0.4;
  bgmElement.play().catch(() => {
    // Blocked until the user interacts; unlock() resumes it.
  });
};

export const stopMusic = () => {
  if (bgmElement) {
    bgmElement.pause();
    bgmElement = null;
  }
  bgmSrc = null;
};
