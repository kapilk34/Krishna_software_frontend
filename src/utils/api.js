const configuredApiUrl = import.meta.env.VITE_API_URL;
const defaultApiUrl = import.meta.env.PROD
  ? "https://krishnasoftwarebackend.vercel.app/api"
  : "http://localhost:5000/api";

const configuredBaseUrl = (configuredApiUrl || defaultApiUrl).replace(/\/+$/, "");

export const API_BASE_URL = /\/api$/i.test(configuredBaseUrl)
  ? configuredBaseUrl
  : `${configuredBaseUrl}/api`;
