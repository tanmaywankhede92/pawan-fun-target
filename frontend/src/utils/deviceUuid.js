const DEVICE_UUID_KEY = "ft_device_uuid";

const getDeviceUuid = () => {
  try {
    let id = localStorage.getItem(DEVICE_UUID_KEY);
    if (id) return id;
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(DEVICE_UUID_KEY, id);
    return id;
  } catch {
    return "unknown";
  }
};

export const deviceUuid = getDeviceUuid();
