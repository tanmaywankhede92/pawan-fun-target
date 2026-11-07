import { SOUNDS, SOUND_MUTED_KEY } from '@constants/sounds';

const files = import.meta.glob(
  '../assets/sounds/*.{mp3,wav,ogg,MP3,WAV,OGG}',
  { eager: true },
);

const getSrc = (name) => {
  let base = SOUNDS[name];
  if (!base) return null;
  let target = `${base.toLowerCase()}.`;
  let key = Object.keys(files).find((k) => {
    const file = k.split('/').pop().toLowerCase();
    return file.startsWith(target);
  });
  if (!key && (name === 'CANCEL' || name === 'ENTER' || name === 'POPUP')) {
    const fallbackBase = SOUNDS.CLICK;
    const fallbackTarget = `${fallbackBase.toLowerCase()}.`;
    key = Object.keys(files).find((k) => {
      const file = k.split('/').pop().toLowerCase();
      return file.startsWith(fallbackTarget);
    });
  }
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
const loopNames = new Set(); // names requested to loop
const activeSources = new Map(); // name -> AudioBufferSourceNode (SFX)
let bgmElement = null;
let bgmSrc = null;

const getCtx = () => {
  if (!ctx || ctx.state === 'closed') {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
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
            // Respect the requested mode: loops keep looping, one-shots
            // play once through the decoded buffer.
            if (loopNames.has(name)) elementLoopPlay(name);
            else playBuffer(name);
          }
        },
        () => {},
      );
    })
    .catch(() => {});
};

// Warm the audio cache in the background while the app boots: decode the
// Web Audio buffers (instant, zero-latency playback) and pre-create the
// element fallbacks so a synced sound (wheel spin) never waits on a
// first-use fetch. Called at the bottom of this module once every helper
// it depends on (getSfxElement, decodeOne) is defined.
const preloadAll = () => {
  if (typeof window === 'undefined') return;
  const ac = getCtx();
  for (const name of Object.keys(SOUNDS)) {
    const src = getSrc(name);
    if (src) {
      if (ac) {
        decodeOne(name, src);
      } else {
        getSfxElement(name, src);
      }
    }
  }
};

const playBuffer = (name) => {
  if (muted) return;
  const buf = buffers.get(name);
  const ac = getCtx();
  if (!buf || !ac) return;
  const prev = activeSources.get(name);
  if (prev) {
    try {
      prev.stop();
      prev.disconnect();
    } catch {
      // already ended
    }
    activeSources.delete(name);
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.connect(ac.destination);
  src.onended = () => {
    try {
      src.disconnect();
    } catch {}
    if (activeSources.get(name) === src) {
      activeSources.delete(name);
    }
  };
  src.start(0);
  activeSources.set(name, src);
};

const playBufferLoop = (name) => {
  if (muted) return;
  const buf = buffers.get(name);
  const ac = getCtx();
  if (!buf || !ac) return;
  const prev = activeSources.get(name);
  if (prev) {
    try {
      prev.stop();
      prev.disconnect();
    } catch {
      // already ended
    }
    activeSources.delete(name);
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  src.connect(ac.destination);
  src.onended = () => {
    try {
      src.disconnect();
    } catch {}
    if (activeSources.get(name) === src) {
      activeSources.delete(name);
    }
  };
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
  el.volume = 1;
  const attempt = () => {
    el.currentTime = 0;
    const p = el.play();
    if (p) p.catch(() => pendingSounds.add(name));
  };
  // The file may still be loading (e.g. the very first interaction right
  // after boot): wait for canplay so that sound is never lost.
  if (el.readyState >= 2) attempt();
  else el.addEventListener("canplay", attempt, { once: true });
};

const elementLoopPlay = (name) => {
  if (muted) return;
  const src = getSrc(name);
  if (!src) return;
  const el = getSfxElement(name, src);
  if (el.loop && !el.paused) return; // already looping
  el.loop = true;
  const attempt = () => {
    el.currentTime = 0;
    const p = el.play();
    if (p) p.catch(() => pendingSounds.add(name));
  };
  if (el.readyState >= 2) attempt();
  else el.addEventListener("canplay", attempt, { once: true });
};

// Play a one-shot SFX as soon as possible. Prefers the decoded Web Audio
// buffer; if it is still decoding, queue it so decodeOne() starts it the
// moment it is ready — the very first interaction's sound is never lost.
const playOneShot = (name) => {
  if (buffers.has(name)) {
    playBuffer(name);
    return;
  }
  if (!getCtx()) {
    // No Web Audio support at all: rely on the audio element fallback.
    elementPlay(name);
    return;
  }
  pendingSounds.add(name);
};

const unlock = () => {
  const ac = getCtx();
  if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
  unlocked = true;
  for (const name of [...pendingSounds]) {
    pendingSounds.delete(name);
    if (loopNames.has(name)) {
      if (ac && ac.state === 'running' && buffers.has(name)) playBufferLoop(name);
      else elementLoopPlay(name);
    } else {
      playOneShot(name);
    }
  }
  // A BGM that was blocked on the first gesture can now resume.
  if (bgmElement && bgmElement.paused && !muted) {
    bgmElement.play().catch(() => {});
  }
};

['pointerdown', 'touchstart', 'keydown'].forEach((evt) =>
  window.addEventListener(evt, unlock, { capture: true, passive: true }),
);

const isHidden = () =>
  typeof document !== 'undefined' && document.visibilityState === 'hidden';

// Pause looping sounds + BGM when the tab goes to the background, and
// resume them when the user comes back. One-shots already playing are
// short and simply fade out.
const onVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    for (const el of sfxElements.values()) {
      if (el.loop && !el.paused) el.pause();
    }
    for (const [name, src] of activeSources.entries()) {
      if (loopNames.has(name)) {
        try { src.stop(); } catch {}
        activeSources.delete(name);
      }
    }
    if (bgmElement && !bgmElement.paused) bgmElement.pause();
    return;
  }
  for (const el of sfxElements.values()) {
    if (el.loop && el.paused && !muted) el.play().catch(() => {});
  }
  for (const name of loopNames) {
    const ac = getCtx();
    if (ac && ac.state === 'running' && buffers.has(name)) {
      playBufferLoop(name);
    }
  }
  if (bgmElement && bgmElement.paused && !muted) {
    bgmElement.play().catch(() => {});
  }
};
document.addEventListener('visibilitychange', onVisibilityChange);

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

export const playSound = (name, { loop = false, sync = false } = {}) => {
  if (muted || isHidden()) return;
  const src = getSrc(name);
  if (!src) return;
  if (sync) {
    // A synced sound is tied to a visual event (e.g. the wheel spin): it
    // must start in the same instant the event happens and is NEVER queued
    // or flushed late by a later gesture. Play it now if possible (decoded
    // buffer + running context = instant; otherwise a ready element),
    // otherwise skip it silently — a delayed sound is worse than none.
    loopNames.delete(name);
    pendingSounds.delete(name);
    const ac = getCtx();
    if (ac && ac.state === 'running' && buffers.has(name)) {
      playBuffer(name);
    } else if (getSfxElement(name, src).readyState >= 2) {
      elementPlay(name);
    }
    return;
  }
  if (loop) {
    loopNames.add(name);
    const ac = getCtx();
    if (ac && ac.state === 'running' && buffers.has(name)) {
      playBufferLoop(name);
    } else {
      elementLoopPlay(name);
    }
    return;
  }
  loopNames.delete(name);
  pendingSounds.delete(name); // an explicit play supersedes any queued copy
  if (unlocked) {
    playOneShot(name);
    return;
  }
  pendingSounds.add(name);
};

export const stopSound = (name) => {
  loopNames.delete(name);
  pendingSounds.delete(name);
  const src = activeSources.get(name);
  if (src) {
    try {
      src.stop();
      src.disconnect();
    } catch {
      // already ended
    }
    activeSources.delete(name);
  }
  const el = sfxElements.get(name);
  if (el) {
    el.loop = false;
    el.pause();
    el.currentTime = 0;
  }
};

export const playMusic = (name = 'BGM') => {
  if (muted || isHidden()) return;
  const src = getSrc(name);
  if (!src) return;
  if (bgmElement && bgmSrc === src) {
    if (bgmElement.paused) bgmElement.play().catch(() => {});
    return;
  }
  stopMusic();
  bgmSrc = src;
  bgmElement = new Audio(src);
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

export const stopAllSounds = () => {
  stopMusic();
  for (const name of Object.keys(SOUNDS)) {
    stopSound(name);
  }
};

// Run once all helpers above are defined.
preloadAll();
