/**
 * Environment configuration module for mage-engine.
 * Centralizes all environment variables and their default values.
 *
 * Usage:
 *   import env from './env';
 *   const baseUrl = env.MAGE_ASSETS_BASE_URL;
 */

/**
 * Safe window access - returns undefined in non-browser environments
 */
const getWindow = () => (typeof window !== "undefined" ? window : undefined);

/**
 * Gets an environment variable from the window object with a fallback default.
 * @param {string} key - The environment variable name
 * @param {any} defaultValue - Default value if not set
 * @returns {any} - The environment variable value or default
 */
const getEnv = (key, defaultValue = undefined) => {
    const win = getWindow();
    return win && win[key] !== undefined ? win[key] : defaultValue;
};

/**
 * Environment variables with their default values.
 * These are accessed as getters so they're evaluated at access time,
 * not at module load time (important for variables set after page load).
 */
const env = {
    /**
     * Base URL for loading assets (textures, models, audio).
     * Set by mage-studio editor or deployed builds.
     * Default: empty string (paths used as-is for backwards compatibility)
     */
    get MAGE_ASSETS_BASE_URL() {
        return getEnv("MAGE_ASSETS_BASE_URL", "");
    },

    /**
     * Enable debug mode for verbose logging.
     * Default: false
     */
    get MAGE_DEBUG() {
        return getEnv("MAGE_DEBUG", false);
    },

    /**
     * Current project ID (set by mage-studio).
     * Default: empty string
     */
    get MAGE_PROJECT_ID() {
        return getEnv("MAGE_PROJECT_ID", "");
    },

    /**
     * Current build ID (set by deployed builds).
     * Default: empty string
     */
    get MAGE_BUILD_ID() {
        return getEnv("MAGE_BUILD_ID", "");
    },
};

export default env;
