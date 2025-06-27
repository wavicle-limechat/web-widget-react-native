import { WOOT_PREFIX, POST_MESSAGE_EVENTS } from './constants';

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
 * Build the widget URL with parameters
 */
export const buildWidgetUrl = ({ baseUrl, websiteToken, locale, colorScheme, user, customAttributes, cwConversation }) => {
  const params = new URLSearchParams({
    website_token: websiteToken,
    locale: locale || 'en',
    color_scheme: colorScheme || 'light',
  });

  // Add user information if provided
  if (user?.name) params.append('user_name', user.name);
  if (user?.email) params.append('user_email', user.email);
  if (user?.phone_number) params.append('user_phone', user.phone_number);
  if (user?.identifier_hash) params.append('identifier_hash', user.identifier_hash);

  // Add custom attributes
  if (customAttributes && Object.keys(customAttributes).length > 0) {
    params.append('custom_attributes', JSON.stringify(customAttributes));
  }

  // Add cw_conversation if provided
  if (cwConversation) {
    params.append('cw_conversation', cwConversation);
  }

  return `${baseUrl}/widget?${params.toString()}`;
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

/**
 * Simple widget config fetch
 */
export const fetchWidgetConfig = async (baseUrl, websiteToken) => {
  try {
    const response = await fetch(
      `${baseUrl}/widget_config?website_token=${encodeURIComponent(websiteToken)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch widget config: ${response.status}`);
    }

    const data = await response.json();
    return data?.config || {};
  } catch (error) {
    console.error('Error fetching widget config:', error);
    return {}; // Return empty config as fallback
  }
}; 