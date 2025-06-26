export const WOOT_PREFIX = 'limechat-widget:';

export const POST_MESSAGE_EVENTS = {
  SET_LOCALE: 'set-locale',
  SET_CUSTOM_ATTRIBUTES: 'set-custom-attributes',
  SET_USER: 'set-user',
  SET_COLOR_SCHEME: 'set-color-scheme',
  WIDGET_LOADED: 'loaded',
  CLOSE_WIDGET: 'close-widget',
};

export const COLOR_WHITE = '#fff';
export const BG_COLOR_WHITE = '#FFFFFF';
export const BG_COLOR_DARK = '#25292c';

export const WIDGET_CONFIG = {
  DEFAULT_BASE_URL: 'https://app.limechat.ai',
  DEFAULT_LOCALE: 'en',
  DEFAULT_COLOR_SCHEME: 'light',
  DEFAULT_ICON_SIZE: 60,
  DEFAULT_BORDER_RADIUS: 30,
};

export const ERROR_MESSAGES = {
  FETCH_CONFIG_FAILED: 'Failed to fetch widget config',
  ICON_LOAD_FAILED: 'Failed to load widget icon',
  WEBVIEW_ERROR: 'WebView error occurred',
  NETWORK_ERROR: 'Network connection error',
  OFFLINE_ERROR: 'You are currently offline',
  TIMEOUT_ERROR: 'Request timeout',
  INVALID_TOKEN: 'Invalid website token',
  INVALID_URL: 'Invalid URL provided',
};

export const NETWORK_CONFIG = {
  REQUEST_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export const CACHE_KEYS = {
  WIDGET_CONFIG: 'limechat_widget_config',
  USER_DATA: 'limechat_user_data',
  LAST_CONFIG_FETCH: 'limechat_last_config_fetch',
};

export const OFFLINE_MESSAGES = {
  TITLE: 'You\'re Offline',
  MESSAGE: 'Please check your internet connection and try again.',
  BUTTON_TEXT: 'OK',
}; 