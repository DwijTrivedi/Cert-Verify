// Set VITE_API_URL in Render's frontend environment to your backend service URL
// e.g. https://cert-verify-backend.onrender.com
export const API_BASE = `${import.meta.env.VITE_API_URL ?? ""}/api`;
