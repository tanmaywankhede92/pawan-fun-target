import { useSound } from '@hooks/useSound';

const SoundIcon = ({ muted }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3z" />
    {muted ? (
      <path
        d="M16 8l5 8M21 8l-5 8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    ) : (
      <path d="M16.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
    )}
  </svg>
);

const SoundToggle = () => {
  const { muted, toggleMute } = useSound();

  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
      title={muted ? 'Unmute sounds' : 'Mute sounds'}
      className="fixed z-[110] flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-yellow-400/60 bg-black/60 text-yellow-300 backdrop-blur transition-transform hover:scale-110"
      style={{ right: 12, top: 12 }}
    >
      <SoundIcon muted={muted} />
    </button>
  );
};

export default SoundToggle;
