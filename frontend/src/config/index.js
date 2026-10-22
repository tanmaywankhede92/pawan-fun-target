const config = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || 'https://api.funtarget.us/api').trim(),
  appName: import.meta.env.VITE_APP_NAME || 'Fun Target',
};

export default config;
