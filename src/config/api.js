/**
 * Centralized API Configuration
 * Reads VITE_API_URL from environment variables (.env / Vercel),
 * defaulting to the live deployed Vercel backend.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://cskbackend.vercel.app').replace(/\/+$/, '');

/**
 * Normalizes media, profile photo, and file upload URLs.
 * Handles Cloudinary HTTPS URLs as well as relative paths.
 * @param {string} path - URL or relative path
 * @returns {string} Fully-qualified URL
 */
export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export default API_BASE_URL;
