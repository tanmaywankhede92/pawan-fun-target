const DEVICE_UUID_KEY = "ft_device_uuid";

const makeUuid = () => {
  const rand = () => {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const bytes = new Uint32Array(1);
      crypto.getRandomValues(bytes);
      return bytes[0].toString(16);
    }
    return Math.random().toString(16).slice(2);
  };

  const stamp = Date.now().toString(16);
  const tag = `${stamp}-${rand()}-${rand()}`;
  return `ft-${tag}`;
};

const getStorage = () => {
  try {
    if (typeof localStorage !== "undefined") return localStorage;
  } catch {}
  try {
    if (typeof sessionStorage !== "undefined") return sessionStorage;
  } catch {}
  return null;
};

const getDeviceUuid = () => {
  try {
    const storage = getStorage();
    const existing = storage?.getItem(DEVICE_UUID_KEY);
    if (existing) return existing;

    const generated = makeUuid();
    if (storage) {
      storage.setItem(DEVICE_UUID_KEY, generated);
    }
    return generated;
  } catch {
    return `ft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

export const deviceUuid = getDeviceUuid();
