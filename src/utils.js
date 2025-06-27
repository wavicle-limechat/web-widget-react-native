import { WOOT_PREFIX, POST_MESSAGE_EVENTS, ERROR_CODES } from './constants';
import { safeJsonParse, WidgetError } from './utils/errorUtils';

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
 * Safe query string builder - replacement for URLSearchParams for React Native compatibility
 */
const buildQueryString = (params) => {
  const queryParts = [];
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      queryParts.push(`${encodedKey}=${encodedValue}`);
    }
  }
  
  return queryParts.join('&');
};

/**
 * Build the widget URL with parameters
 */
export const buildWidgetUrl = ({ baseUrl, websiteToken, locale, colorScheme, customAttributes, cwConversation }) => {
  const params = {
    website_token: websiteToken,
    locale: locale || 'en',
    color_scheme: colorScheme || 'light',
  };

  if (customAttributes && Object.keys(customAttributes).length > 0) {
    params.custom_attributes = JSON.stringify(customAttributes);
  }

  if (cwConversation) {
    params.cw_conversation = cwConversation;
  }

  const queryString = buildQueryString(params);
  return `${baseUrl}/widget?${queryString}`;
};

/**
 * Generate JavaScript to inject into WebView
 */
export const generateScripts = ({ colorScheme, user, locale, customAttributes }) => {
  let script = '';

  // Set user data
  if (user && Object.keys(user).length > 0) {
    const userObject = {
      event: POST_MESSAGE_EVENTS.SET_USER,
      identifier: user.identifier_hash,
      user,
    };
    script += createWootPostMessage(userObject);

    // Set user data globally for form prefill
    script += `
      window.chatwootWebChannel = window.chatwootWebChannel || {};
      window.chatwootWebChannel.rnUser = {
        name: ${JSON.stringify(user.name || '')},
        email: ${JSON.stringify(user.email || '')},
        phone_number: ${JSON.stringify(user.phone_number || '')},
        identifier: ${JSON.stringify(user.identifier_hash || '')}
      };
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

export const fetchWidgetConfig = async (baseUrl, websiteToken) => {
  try {
    if (!websiteToken) {
      throw new WidgetError(
        ERROR_CODES.CONFIG_ERROR,
        'Website token is required for fetching widget config',
        null,
        { baseUrl }
      );
    }

    const response = await fetch(
      `${baseUrl}/widget_config?website_token=${encodeURIComponent(websiteToken)}`
    );

    if (!response.ok) {
      // Check if it's a 401/403 (invalid token) or other API error
      if (response.status === 401 || response.status === 403) {
        throw new WidgetError(
          ERROR_CODES.CONFIG_ERROR,
          `Invalid website token: HTTP ${response.status}`,
          null,
          { baseUrl, websiteToken, status: response.status }
        );
      } else {
        throw new WidgetError(
          ERROR_CODES.NETWORK_ERROR,
          `Failed to fetch widget config: HTTP ${response.status}`,
          null,
          { baseUrl, websiteToken, status: response.status }
        );
      }
    }

    const data = await response.json();

    let config = data?.config || {};
    if(typeof config === 'string') {
      // Use safe JSON parsing for nested config strings
      config = safeJsonParse(config, {});
      if (config === null) {
        throw new WidgetError(
          ERROR_CODES.CONFIG_ERROR,
          'Widget config contains invalid JSON',
          null,
          { rawConfig: data?.config }
        );
      }
    }

    // Check if config is empty - this means invalid website token or no configuration set up
    if (!config || Object.keys(config).length === 0) {
      throw new WidgetError(
        ERROR_CODES.CONFIG_ERROR,
        'No widget configuration found for this website token. Please check your token or set up widget configuration.',
        null,
        { baseUrl, websiteToken, receivedConfig: config }
      );
    }

    return config;
  } catch (error) {
    if (error instanceof WidgetError) {
      throw error;
    }
    
    // Handle network errors
    throw new WidgetError(
      ERROR_CODES.NETWORK_ERROR,
      `Network error while fetching widget config: ${error.message}`,
      error,
      { baseUrl, websiteToken }
    );
  }
}; 