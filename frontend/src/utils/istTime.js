// Real-world Indian time (IST = UTC+5:30). Backend results are
// published every minute at HH:MM:00 IST, so everything time-based
// (game timer, result refresh) is synced to the IST minute boundary.
export const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

const pad = (n) => String(n).padStart(2, "0");

export const istSeconds = () => {
  const d = new Date(Date.now() + IST_OFFSET_MS);
  return d.getUTCSeconds();
};

export const secondsToNextMinute = (s) => (s === 0 ? 0 : 60 - s);

const getIstParts = () => {
  const d = new Date(Date.now() + IST_OFFSET_MS);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hours: d.getUTCHours(),
    minutes: d.getUTCMinutes(),
  };
};

// "2026-08-10"
export const istDateStr = () => {
  const p = getIstParts();
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
};

// "12:05" (24h, no seconds)
export const istTimeStr = () => {
  const p = getIstParts();
  return `${pad(p.hours)}:${pad(p.minutes)}`;
};

// "11:32:00 AM" (12h). minuteOffset lets callers pick the next minute.
export const ist12hStr = (minuteOffset = 0) => {
  const p = getIstParts();
  const totalMinutes = p.hours * 60 + p.minutes + minuteOffset;
  const h = ((Math.floor(totalMinutes / 60) % 24) + 24) % 24;
  const m = ((totalMinutes % 60) + 60) % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${pad(h12)}:${pad(m)}:00 ${ampm}`;
};

// "11:33:00" (24h). minuteOffset lets callers pick the next minute.
export const ist24hStr = (minuteOffset = 0) => {
  const p = getIstParts();
  const totalMinutes = p.hours * 60 + p.minutes + minuteOffset;
  const h = ((Math.floor(totalMinutes / 60) % 24) + 24) % 24;
  const m = ((totalMinutes % 60) + 60) % 60;
  return `${pad(h)}:${pad(m)}:00`;
};
