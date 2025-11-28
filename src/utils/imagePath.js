/**
 * Prepends the Vite base URL to the given path.
 * This ensures assets are loaded correctly both locally and in production (GitHub Pages).
 * 
 * @param {string} path - The absolute path to the asset (e.g., '/photos/img.jpg')
 * @returns {string} - The full path including the base URL
 */
export const getImagePath = (path) => {
    if (!path) return '';

    // If the path is already a full URL (e.g. flags from CDN), return it as is
    if (path.startsWith('http')) return path;

    const baseUrl = import.meta.env.BASE_URL;

    // Remove leading slash from path if it exists to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // Remove trailing slash from baseUrl if it exists
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    return `${cleanBase}/${cleanPath}`;
};
