const defaultApiUrl = import.meta.env.PROD
  ? "https://rgms-system-new.onrender.com/api"
  : "http://localhost:5000/api";
const configuredApiUrl = (import.meta.env.VITE_API_URL || defaultApiUrl).replace(/\/+$/, "");

export const API_BASE_URL = /\/api$/i.test(configuredApiUrl)
  ? configuredApiUrl
  : `${configuredApiUrl}/api`;

export const SOCKET_URL = API_BASE_URL.replace(/\/api$/i, "");
