// Real-world Indian time (IST = UTC+5:30). Backend results are
// published every minute at HH:MM:00 IST, so everything time-based
// (game timer, result refresh) is synced to the IST minute boundary.
export const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

export const istSeconds = () => {
  const d = new Date(Date.now() + IST_OFFSET_MS);
  return d.getUTCSeconds();
};

export const secondsToNextMinute = (s) => (s === 0 ? 0 : 60 - s);
