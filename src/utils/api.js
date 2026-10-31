const configuredApiUrl = import.meta.env.VITE_API_URL;
const defaultApiUrl = import.meta.env.PROD
  ? "https://krishnasoftwarebackend.vercel.app/api"
  : "http://localhost:5000/api";

export const API_BASE_URL = (configuredApiUrl || defaultApiUrl).replace(/\/+$/, "");
