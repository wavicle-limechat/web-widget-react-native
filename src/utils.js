import {
    BG_COLOR_DARK,
    BG_COLOR_WHITE,
    COLOR_WHITE,
    POST_MESSAGE_EVENTS,
    WOOT_PREFIX,
    ERROR_MESSAGES,
    NETWORK_CONFIG,
    CACHE_KEYS,
} from './constants';

// Optional imports for enhanced features
let NetInfo = null;
let AsyncStorage = null;

try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch (e) {
  console.warn('LimeChat: @react-native-community/netinfo not available. Offline detection disabled.');
}

try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  console.warn('LimeChat: @react-native-async-storage/async-storage not available. Caching disabled.');
}

// Test helper function to inject dependencies
export const __setTestDependencies = (testDependencies) => {
  if (testDependencies.AsyncStorage) {
    AsyncStorage = testDependencies.AsyncStorage;
  }
  if (testDependencies.NetInfo) {
    NetInfo = testDependencies.NetInfo;
  }
};

/**
 * Check if a string is valid JSON
 */
export const isJsonString = (string) => {
  try {
    JSON.parse(string);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validate URL format
 */
export const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate website token format
 */
export const isValidWebsiteToken = (token) => {
  return typeof token === 'string' && token.length > 0 && !/[<>'"&]/.test(token);
};

/**
 * Check network connectivity (gracefully falls back if NetInfo unavailable)
 */
export const checkNetworkConnectivity = async () => {
  if (!NetInfo) {
    // Fallback: assume online if NetInfo is not available
    console.warn('LimeChat: Network detection unavailable, assuming online');
    return true;
  }
  
  try {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected && netInfo.isInternetReachable;
  } catch (error) {
    console.warn('Error checking network connectivity:', error);
    // Assume online if check fails
    return true;
  }
};

/**
 * Sleep utility for retry delays
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async (fn, maxRetries = NETWORK_CONFIG.RETRY_ATTEMPTS) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i === maxRetries - 1) break;
      
      const delay = NETWORK_CONFIG.RETRY_DELAY * Math.pow(2, i);
      await sleep(delay);
    }
  }
  
  throw lastError;
};

/**
 * Create a post message script for WebView communication
 */
export const createWootPostMessage = (object) => {
  const stringifyObject = `'${WOOT_PREFIX}${JSON.stringify(object)}'`;
  const script = `window.postMessage(${stringifyObject});`;
  return script;
};

/**
 * Extract message from post message data
 */
export const getMessage = (data) => data.replace(WOOT_PREFIX, '');

/**
 * Build the widget URL with all parameters
 */
export const buildWidgetUrl = ({ baseUrl, websiteToken, locale, colorScheme, user, customAttributes }) => {
  // Validate inputs
  if (!isValidUrl(baseUrl)) {
    throw new Error(ERROR_MESSAGES.INVALID_URL);
  }
  
  if (!isValidWebsiteToken(websiteToken)) {
    throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
  }

  const params = new URLSearchParams({
    website_token: sanitizeInput(websiteToken),
    locale: sanitizeInput(locale),
    color_scheme: sanitizeInput(colorScheme),
  });

  // Add user information if provided (with sanitization)
  if (user?.name) params.append('user_name', sanitizeInput(user.name));
  if (user?.email) params.append('user_email', sanitizeInput(user.email));
  if (user?.phone_number) params.append('user_phone', sanitizeInput(user.phone_number));
  if (user?.identifier_hash) params.append('identifier_hash', sanitizeInput(user.identifier_hash));

  // Add custom attributes (with validation)
  if (customAttributes && Object.keys(customAttributes).length > 0) {
    try {
      const sanitizedAttributes = Object.keys(customAttributes).reduce((acc, key) => {
        const value = customAttributes[key];
        acc[sanitizeInput(key)] = typeof value === 'string' ? sanitizeInput(value) : value;
        return acc;
      }, {});
      params.append('custom_attributes', JSON.stringify(sanitizedAttributes));
    } catch (error) {
      console.warn('Error processing custom attributes:', error);
    }
  }

  return `${baseUrl}/widget?${params.toString()}`;
};

/**
 * Generate JavaScript to inject into WebView for user data and settings
 */
export const generateScripts = ({ colorScheme, user, locale, customAttributes }) => {
  let script = '';

  // Set user data for both widget communication and PrechatForm prefill
  if (user && Object.keys(user).length > 0) {
    const userObject = {
      event: POST_MESSAGE_EVENTS.SET_USER,
      identifier: user.identifier_hash,
      user,
    };
    script += createWootPostMessage(userObject);

    // Set user data globally for PrechatForm access
    script += `
      (function() {
        if (!window.chatwootWebChannel) {
          window.chatwootWebChannel = {};
        }
        window.chatwootWebChannel.rnUser = {
          name: ${JSON.stringify(user.name || '')},
          email: ${JSON.stringify(user.email || '')},
          phone_number: ${JSON.stringify(user.phone_number || '')},
          identifier: ${JSON.stringify(user.identifier_hash || '')}
        };
        
        // Also set for backward compatibility
        window.rnUser = window.chatwootWebChannel.rnUser;
        
        console.log('LimeChat: User data set for prefill:', window.chatwootWebChannel.rnUser);
      })();
    `;
  }

  // Set locale
  if (locale) {
    const localeObject = { 
      event: POST_MESSAGE_EVENTS.SET_LOCALE, 
      locale 
    };
    script += createWootPostMessage(localeObject);
  }

  // Set custom attributes
  if (customAttributes && Object.keys(customAttributes).length > 0) {
    const attributeObject = {
      event: POST_MESSAGE_EVENTS.SET_CUSTOM_ATTRIBUTES,
      customAttributes,
    };
    script += createWootPostMessage(attributeObject);
  }

  // Set color scheme
  if (colorScheme) {
    const themeObject = { 
      event: POST_MESSAGE_EVENTS.SET_COLOR_SCHEME, 
      darkMode: colorScheme === 'dark' 
    };
    script += createWootPostMessage(themeObject);
  }

  return script;
};

/**
 * Determine colors based on color scheme and app theme
 */
export const findColors = ({ colorScheme, appColorScheme }) => {
  let headerBackgroundColor = COLOR_WHITE;
  let mainBackgroundColor = BG_COLOR_WHITE;

  if (colorScheme === 'dark' || (colorScheme === 'auto' && appColorScheme === 'dark')) {
    headerBackgroundColor = BG_COLOR_DARK;
    mainBackgroundColor = BG_COLOR_DARK;
  } else if (colorScheme === 'auto' && appColorScheme === 'light') {
    headerBackgroundColor = COLOR_WHITE;
    mainBackgroundColor = BG_COLOR_WHITE;
  }

  return {
    headerBackgroundColor,
    mainBackgroundColor,
  };
};

// In-memory cache fallback for when AsyncStorage is not available
const memoryCache = new Map();

/**
 * Cache management utilities (with fallback to memory cache)
 */
export const cacheUtils = {
  async get(key) {
    if (!AsyncStorage) {
      // Use memory cache fallback
      const item = memoryCache.get(key);
      return item ? item.data : null;
    }
    
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;
      const item = JSON.parse(value);
      return item?.data || null;
    } catch (error) {
      console.warn(`Error reading cache for key ${key}:`, error);
      return null;
    }
  },

  async set(key, value, ttl = null) {
    if (!AsyncStorage) {
      // Use memory cache fallback
      const item = {
        data: value,
        timestamp: Date.now(),
        ttl,
      };
      memoryCache.set(key, item);
      return;
    }
    
    try {
      const item = {
        data: value,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn(`Error writing cache for key ${key}:`, error);
    }
  },

  async isExpired(key) {
    try {
      let item;
      if (!AsyncStorage) {
        item = memoryCache.get(key);
      } else {
        const value = await AsyncStorage.getItem(key);
        item = value ? JSON.parse(value) : null;
      }
      
      if (!item || !item.ttl) return false;
      return Date.now() - item.timestamp > item.ttl;
    } catch (error) {
      return true;
    }
  },

  async remove(key) {
    if (!AsyncStorage) {
      memoryCache.delete(key);
      return;
    }
    
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing cache for key ${key}:`, error);
    }
  },
};

/**
 * Fetch widget configuration from the server with caching and error handling
 */
export const fetchWidgetConfig = async (baseUrl, websiteToken) => {
  // Validate inputs
  if (!isValidUrl(baseUrl)) {
    throw new Error(ERROR_MESSAGES.INVALID_URL);
  }
  
  if (!isValidWebsiteToken(websiteToken)) {
    throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
  }

  // Check cache first
  const cacheKey = `${CACHE_KEYS.WIDGET_CONFIG}_${websiteToken}`;
  const cachedConfig = await cacheUtils.get(cacheKey);
  
  if (cachedConfig && !await cacheUtils.isExpired(cacheKey)) {
    return cachedConfig;
  }

  // Check network connectivity
  const isOnline = await checkNetworkConnectivity();
  if (!isOnline) {
    if (cachedConfig) {
      console.warn('Using cached config due to offline status');
      return cachedConfig;
    }
    throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
  }

  const fetchConfig = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NETWORK_CONFIG.REQUEST_TIMEOUT);

    try {
      const response = await fetch(
        `${baseUrl}/widget_config?website_token=${encodeURIComponent(websiteToken)}`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch widget config'}`);
      }

      const data = await response.json();
      
      let config = data?.config;
      if (typeof config === 'string') {
        config = JSON.parse(config) || {};
      }

      // Cache the successful response
      await cacheUtils.set(cacheKey, config, 5 * 60 * 1000); // 5 minutes TTL

      return config;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
      }
      
      throw error;
    }
  };

  try {
    return await retryWithBackoff(fetchConfig);
  } catch (error) {
    console.error('Error fetching widget config:', error);
    
    // Return cached config as fallback if available
    if (cachedConfig) {
      console.warn('Using stale cached config due to fetch error');
      return cachedConfig;
    }
    
    throw error;
  }
}; 